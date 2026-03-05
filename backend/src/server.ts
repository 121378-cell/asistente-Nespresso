import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import repairsRouter from './routes/repairsRouter.js';
import analyticsRouter from './routes/analyticsRouter.js';
import chatRouter from './routes/chatRouter.js';
import videoRouter from './routes/videoRouter.js';
import authRouter from './routes/authRouter.js';
import jobsRouter from './routes/jobsRouter.js';
import sparePartsRouter from './routes/sparePartsRouter.js';
import knowledgeRouter from './routes/knowledgeRouter.js';
import { env } from './config/env.js';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();
import { globalLimiter } from './middleware/rateLimiter.js';
import { authenticate } from './middleware/auth.js';
import { logger } from './config/logger.js';
import { httpLogger } from './middleware/httpLogger.js';
import { getHttpMetricsSnapshot, httpMetricsMiddleware } from './middleware/httpMetrics.js';
import { startVideoJobWorker, stopVideoJobWorker } from './workers/videoJobWorker.js';
import { startImageJobWorker, stopImageJobWorker } from './workers/imageJobWorker.js';
import { getVideoAsyncMetricsSnapshot } from './services/videoJobService.js';
import { getImageAsyncMetricsSnapshot } from './services/imageJobService.js';
import { logAndSendInternalError } from './utils/errorResponse.js';

const app: Application = express();
const PORT = env.port;
const ALLOWED_ORIGINS = env.allowedOrigins;
const isProduction = env.nodeEnv === 'production';
const LOCAL_ORIGIN_REGEX = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

if (env.trustProxy) {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        ALLOWED_ORIGINS.includes(origin) ||
        (!isProduction && LOCAL_ORIGIN_REGEX.test(origin))
      ) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS policy'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' })); // Increased limit for image attachments
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(
  ['/api', '/health', '/metrics'],
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        baseUri: ["'none'"],
        frameAncestors: ["'none'"],
        formAction: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Apply HTTP logging middleware (before routes)
app.use(httpLogger);
app.use(httpMetricsMiddleware);

// Apply global rate limiting to all API routes
app.use('/api/', globalLimiter);

const setupSwaggerDocs = async () => {
  if (isProduction) {
    return;
  }

  try {
    const [{ default: swaggerUi }, { swaggerSpec }] = await Promise.all([
      import('swagger-ui-express'),
      import('./config/swagger.js'),
    ]);

    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Nespresso Assistant API Docs',
      })
    );

    logger.info('Swagger docs endpoint enabled');
  } catch (error) {
    logger.warn({ err: error }, 'Swagger docs could not be initialized');
  }
};

void setupSwaggerDocs();

// Routes
const devAuth = isProduction
  ? authenticate
  : (_req: Request, _res: Response, next: NextFunction) => next();

app.use('/api/auth', authRouter);
app.use('/api/repairs', devAuth, repairsRouter);
app.use('/api/analytics', devAuth, analyticsRouter);
app.use('/api/jobs', devAuth, jobsRouter);
app.use('/api/spare-parts', sparePartsRouter);
app.use('/api/knowledge', devAuth, knowledgeRouter);

if (!isProduction) {
  app.post('/api/admin/import-spare-parts', devAuth, async (req, res) => {
    try {
      const XLSX = (await import('xlsx')).default;
      const filePath = path.resolve('../data/inventory/ZN100.xlsm');
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
      const dataRows = data.slice(8);
      let count = 0;

      for (const row of dataRows) {
        if (!row || row.length < 4) continue;
        const family = String(row[1] || '').trim();
        const partNumber = String(row[2] || '').trim();
        const name = String(row[3] || '').trim();
        const category = String(row[4] || '').trim();
        if (!partNumber || !name) continue;

        await prismaClient.sparePart.upsert({
          where: { partNumber },
          update: { name, family, category },
          create: { partNumber, name, family, category },
        });
        count++;
      }
      res.json({ success: true, count });
    } catch (error) {
      return logAndSendInternalError(
        req,
        res,
        error,
        'Failed to import spare parts from admin endpoint',
        'Failed to import spare parts'
      );
    }
  });
}

app.use('/api/chat', chatRouter);
app.use('/api/video', videoRouter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
});

// Basic observability endpoint for dashboards and alerting.
app.get('/metrics', async (req: Request, res: Response) => {
  let videoAsync = null;
  let imageAsync = null;
  try {
    videoAsync = await getVideoAsyncMetricsSnapshot();
  } catch (error) {
    logger.error({ err: error, requestId: req.id }, 'Failed to collect video async metrics');
  }
  try {
    imageAsync = await getImageAsyncMetricsSnapshot();
  } catch (error) {
    logger.error({ err: error, requestId: req.id }, 'Failed to collect image async metrics');
  }

  res.json({
    requestId: req.id,
    http: getHttpMetricsSnapshot(),
    videoAsync,
    imageAsync,
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
  res.status(500).json({
    error: 'Internal server error',
    requestId: req.id,
    message: env.nodeEnv === 'development' ? err.message : undefined,
  });
});

// Start server
const server = app.listen(PORT, () => {
  startVideoJobWorker();
  startImageJobWorker();
  logger.info(
    {
      port: PORT,
      env: env.nodeEnv,
      allowedOrigins: ALLOWED_ORIGINS,
      llmProvider: env.llmProvider,
    },
    'Server started successfully'
  );
});

const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Shutting down server');
  await stopVideoJobWorker();
  await stopImageJobWorker();
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

export default app;

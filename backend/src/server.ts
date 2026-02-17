import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import repairsRouter from './routes/repairsRouter.js';
import analyticsRouter from './routes/analyticsRouter.js';
import chatRouter from './routes/chatRouter.js';
import videoRouter from './routes/videoRouter.js';
import { env } from './config/env.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { logger } from './config/logger.js';
import { httpLogger } from './middleware/httpLogger.js';
import { getHttpMetricsSnapshot, httpMetricsMiddleware } from './middleware/httpMetrics.js';
import { swaggerSpec } from './config/swagger.js';

const app: Application = express();
const PORT = env.port;
const ALLOWED_ORIGINS = env.allowedOrigins;

if (env.trustProxy) {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
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

// Swagger API Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Nespresso Assistant API Docs',
  })
);

// Routes
app.use('/api/repairs', repairsRouter);
app.use('/api/analytics', analyticsRouter);
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
app.get('/metrics', (req: Request, res: Response) => {
  res.json({
    requestId: req.id,
    ...getHttpMetricsSnapshot(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
  res.status(500).json({
    error: 'Internal server error',
    requestId: req.id,
    message: env.nodeEnv === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(
    {
      port: PORT,
      env: env.nodeEnv,
      allowedOrigins: ALLOWED_ORIGINS,
    },
    'Server started successfully'
  );
});

export default app;

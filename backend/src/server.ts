import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import repairsRouter from './routes/repairsRouter.js';
import analyticsRouter from './routes/analyticsRouter.js';
import chatRouter from './routes/chatRouter.js';
import videoRouter from './routes/videoRouter.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { logger } from './config/logger.js';
import { httpLogger } from './middleware/httpLogger.js';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Increased limit for image attachments
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Apply HTTP logging middleware (before routes)
app.use(httpLogger);

// Apply global rate limiting to all API routes
app.use('/api/', globalLimiter);


// Routes
app.use('/api/repairs', repairsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/video', videoRouter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    logger.info({
        port: PORT,
        env: process.env.NODE_ENV || 'development',
        corsOrigin: FRONTEND_URL
    }, 'Server started successfully');
});

export default app;

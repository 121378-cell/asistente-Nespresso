import rateLimit from 'express-rate-limit';

/**
 * Rate limiter global para todos los endpoints
 * Límite: 100 requests por 15 minutos
 */
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests por ventana
    message: {
        error: 'Too many requests from this IP, please try again later',
        retryAfter: '15 minutes',
    },
    standardHeaders: true, // Incluir headers RateLimit-*
    legacyHeaders: false, // Deshabilitar headers X-RateLimit-*
});

/**
 * Rate limiter para endpoints de chat
 * Límite: 30 requests por 15 minutos
 * Más restrictivo porque consume recursos de IA
 */
export const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: {
        error: 'Too many chat requests, please wait before sending more messages',
        retryAfter: '15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Contar todas las requests
});

/**
 * Rate limiter para generación de videos
 * Límite: 5 requests por hora
 * Muy restrictivo porque es una operación muy costosa
 */
export const videoLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5,
    message: {
        error: 'Video generation limit reached, please try again in an hour',
        retryAfter: '1 hour',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter para endpoints de analytics y repairs
 * Límite: 50 requests por 15 minutos
 * Moderado para operaciones de lectura/escritura
 */
export const analyticsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
        error: 'Too many requests, please slow down',
        retryAfter: '15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter ligero para operaciones de lectura
 * Límite: 200 requests por 15 minutos
 */
export const readLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        error: 'Too many read requests, please slow down',
        retryAfter: '15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

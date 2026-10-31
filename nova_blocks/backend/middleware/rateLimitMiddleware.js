const rateLimit = require('express-rate-limit');

// ============================================
// General API Rate Limiter
// 200 requests per 15 minutes per IP
// ============================================
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per window
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// ============================================
// Auth Rate Limiter
// 5 attempts per 15 minutes per IP - prevents brute force attacks
// ============================================
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // LIMIT: Only 5 auth attempts per IP per window to prevent brute force
    message: 'Too many authentication attempts, please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
});

// ============================================
// GPU Operations Rate Limiter
// 30 operations per hour per IP - prevents GPU resource exhaustion
// ============================================
const gpuLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // Limit GPU operations to 30 per hour per IP
    message: 'GPU operation limit exceeded, please try again later.',
});

// ============================================
// Export all limiters for use in index.js
// app.use('/api/', limiter) should use generalLimiter
// Auth routes should use authLimiter
// GPU routes should use gpuLimiter
// ============================================
module.exports = {
    generalLimiter,
    authLimiter,
    gpuLimiter
};

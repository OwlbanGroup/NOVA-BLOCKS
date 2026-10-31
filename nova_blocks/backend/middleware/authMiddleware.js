const jwt = require('jsonwebtoken');

// Validate JWT_SECRET on startup
if (!process.env.JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET environment variable is not set!');
    process.exit(1);
}

// JWT verification options - include explicit expiration check
const jwtVerifyOptions = {
    ignoreExpiration: false,
    // The expiresIn claim is automatically checked by jwt.verify
};

const authMiddleware = (req, res, next) => {
    // Extract token from Authorization header - handle Bearer token format
    let token = req.headers['authorization'];
    
    if (!token) {
        console.error(`Unauthorized access attempt: No token provided at ${req.method} ${req.url}`);
        return res.status(401).json({ message: 'No token provided' });
    }
    
    // Strip "Bearer " prefix if present (support standard OAuth format)
    if (token.startsWith('Bearer ')) {
        token = token.substring(7);
    }
    
    jwt.verify(token, process.env.JWT_SECRET, jwtVerifyOptions, (err, decoded) => {
        if (err) {
            // Specific error handling for token expiration
            if (err.name === 'TokenExpiredError') {
                console.error(`Token expired at ${req.method} ${req.url}`);
                return res.status(401).json({ message: 'Token has expired' });
            }
            if (err.name === 'JsonWebTokenError') {
                console.error(`Invalid token format at ${req.method} ${req.url}`, err.message);
                return res.status(401).json({ message: 'Invalid token format' });
            }
            if (err.name === 'NotBeforeError') {
                console.error(`Token not yet valid at ${req.method} ${req.url}`);
                return res.status(401).json({ message: 'Token not yet valid' });
            }
            console.error(`Unauthorized access attempt: Invalid token at ${req.method} ${req.url}`, err.message);
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        req.userId = decoded.id;
        req.userRole = decoded.role;

        // FIXED: Allow all authenticated users with valid roles (not blocking non-admin)
        // Restrict access only for specific admin-only endpoints
        next();
    });
};

module.exports = authMiddleware;

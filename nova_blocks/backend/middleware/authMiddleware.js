const jwt = require('jsonwebtoken');

// Validate JWT_SECRET on startup
if (!process.env.JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET environment variable is not set!');
    process.exit(1);
}

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
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
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

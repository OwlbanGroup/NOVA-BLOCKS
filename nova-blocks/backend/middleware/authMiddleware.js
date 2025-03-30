const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        console.error(`Unauthorized access attempt: No token provided at ${req.method} ${req.url}`);
        return res.status(401).json({ message: 'No token provided' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error(`Unauthorized access attempt: Invalid token at ${req.method} ${req.url}`);
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.userId = decoded.id;
        next();
    });
};



module.exports = authMiddleware;

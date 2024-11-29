const jwt = require('jsonwebtoken');
const config = require('../config');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header or cookie
        let token = req.cookies.token;
        
        // If no cookie token, check Authorization header
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token missing!'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, config.jwtSecret);
            req.user = decoded;
            console.log(' Token verified, user:', decoded);
            next();
        } catch (err) {
            console.error(' Token verification failed:', err);
            return res.status(401).json({
                success: false,
                message: 'Invalid token!'
            });
        }
    } catch (err) {
        console.error(' Auth middleware error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
};

module.exports = authMiddleware;
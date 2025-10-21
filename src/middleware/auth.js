const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */

/**
 * Authenticate middleware
 * Verifies Bearer token from Authorization header
 * Attaches decoded user info to req.user
 */
const authenticate = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        // Check if Authorization header exists and has Bearer token
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'No token provided. Please include a Bearer token in the Authorization header'
            });
        }

        // Extract token (remove 'Bearer ' prefix)
        const token = authHeader.substring(7);

        // Verify token with JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request object for use in route handlers
        req.user = {
            userId: decoded.userId,
            email: decoded.email
        };

        // Continue to next middleware/route handler
        next();
    } catch (error) {
        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Invalid token. Please provide a valid authentication token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Token has expired. Please login again'
            });
        }

        // Generic error
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Error authenticating user'
        });
    }
};

/**
 * Optional middleware
 * Same as authenticate but doesn't fail if token is missing
 * Useful for routes that work with or without authentication
 */
const optionalAuthenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided, continue without user info
            return next();
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            userId: decoded.userId,
            email: decoded.email
        };

        next();
    } catch (error) {
        // Invalid token, but don't fail - just continue without user info
        next();
    }
};

/**
 * Authorization middleware (for future use with role-based access)
 * Checks if authenticated user has required role(s)
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Authentication required'
            });
        }

        if (req.user.role && !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'You do not have permission to access this resource'
            });
        }

        next();
    };
};

module.exports = {
    authenticate,
    optionalAuthenticate,
    authorize
};
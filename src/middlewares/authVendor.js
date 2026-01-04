import { verifyToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';

export default (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        // Verify token is for a vendor
        if (decoded.type !== 'vendor') {
            throw new UnauthorizedError('Invalid token type');
        }

        req.vendor = {
            id: decoded.id,
            email: decoded.email,
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            throw new UnauthorizedError('Invalid or expired token');
        }
        throw error;
    }
};


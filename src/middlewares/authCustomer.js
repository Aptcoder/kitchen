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

        // Verify token is for a customer
        if (decoded.type !== 'customer') {
            throw new UnauthorizedError('Invalid token type');
        }

        req.customer = {
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


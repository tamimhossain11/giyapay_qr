import jwt from 'jsonwebtoken';
import BlacklistedToken from '../model/blacklistedTokenModel.js';

export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token is missing' });
    }

    try {
        // Check if the token is blacklisted (for logout functionality)
        const isBlacklisted = await BlacklistedToken.findOne({ where: { token } });
        if (isBlacklisted) {
            return res.status(403).json({ error: 'Token has been blacklisted' });
        }

        // Verify token and check expiration
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ error: 'Token expired' });
                }
                return res.status(403).json({ error: 'Invalid token' });
            }

            req.user = user;
            req.token = token;
            next();
        });
    } catch (error) {
        console.error('Token authentication error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

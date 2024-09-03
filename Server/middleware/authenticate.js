import jwt from 'jsonwebtoken';
import BlacklistedToken from '../model/blacklistedTokenModel.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  try {
    const blacklisted = await BlacklistedToken.findOne({ where: { token } });
    if (blacklisted) {
      console.error('Token is blacklisted');
      return res.sendStatus(403);
    }

    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      console.error('JWT secret key is not defined in environment variables');
      return res.sendStatus(500);
    }

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          console.warn('Token has expired');
          return res.sendStatus(401);
        } else {
          console.error('Error verifying token:', err);
          return res.sendStatus(403);
        }
      }
      req.user = user;
      req.token = token;
      next();
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.sendStatus(500);
  }
};

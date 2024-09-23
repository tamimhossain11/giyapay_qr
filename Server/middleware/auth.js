import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/userModel.js';
import Admin from '../model/adminModel.js';
import BlacklistedToken from '../model/blacklistedTokenModel.js';
import { authenticateToken } from '../middleware/authenticate.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        let user = await Admin.findOne({ where: { email } });

        if (!user) {
            user = await User.findOne({ where: { email } });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.status === 'Inactive') {
            return res.status(403).json({ error: 'Account is inactive. Please contact support.' });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.user_type === 'Branch User' && !user.branch_id) {
            return res.status(403).json({ error: 'You are not assigned to any branch. Please contact support.' });
        }

        const token = jwt.sign({
            id: user.id,
            userType: user.user_type || 'admin',
        }, JWT_SECRET, { expiresIn: '30m' });

        res.json({
            token,
            userType: user.user_type || 'admin',
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Logout route
router.post('/logout', async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    try {
        // Decode the token without verification (use jwt.decode instead of jwt.verify)
        const decoded = jwt.decode(token);
        const expirationDate = decoded ? new Date(decoded.exp * 1000) : new Date();

        // Blacklist the token
        await BlacklistedToken.create({
            token,
            expirationDate
        });

        console.log('Logout successful');
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


export default router;
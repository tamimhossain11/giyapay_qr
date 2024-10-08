import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/userModel.js';
import Admin from '../model/adminModel.js';
import BlacklistedToken from '../model/blacklistedTokenModel.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Check if the user exists in either Admin or User tables
        let user = await Admin.findOne({ where: { email } }) || await User.findOne({ where: { email } });

        // If no user is found
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check account status
        if (user.status === 'Inactive') {
            return res.status(403).json({ error: 'Account is inactive. Please contact support.' });
        }

        // Validate password
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Branch user specific validation
        if (user.user_type === 'Branch User' && !user.branch_id) {
            return res.status(403).json({ error: 'You are not assigned to any branch. Please contact support.' });
        }

        // Generate JWT token payload
        const tokenPayload = {
            admin_id: user.admin_id || (user.user_type === 'admin' ? user.id : null), 
            id: user.id,
            userType: user.user_type || 'admin',  
        };

        // Sign the token
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30m' });

        // Send the response
        res.json({
            token,
            userType: user.user_type || 'admin',
            message: 'Login successful',
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
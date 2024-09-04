import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Sequelize } from 'sequelize';
import authRoutes from './middleware/auth.js';
import userRoutes from './Routes/userRoutes.js';
import adminRoutes from './Routes/adminRoutes.js';
import branchesRoutes from './Routes/branchesRoutes.js';
import BlacklistedToken from './model/blacklistedTokenModel.js';
import qrCodesRoute from './Routes/qrCodesRoutes.js'
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    origin: 'https://giyapay-qr.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// Define routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/branches', branchesRoutes);
app.use('/api/qr-codes', qrCodesRoute);

// Cleanup old blacklisted tokens
const cleanUpBlacklistedTokens = async () => {
    try {
        const now = new Date();
        await BlacklistedToken.destroy({
            where: {
                expirationDate: {
                    [Sequelize.Op.lt]: now,
                },
            },
        });
        console.log('Old blacklisted tokens cleaned up successfully.');
    } catch (error) {
        console.error('Error cleaning up blacklisted tokens:', error);
    }
};

setInterval(cleanUpBlacklistedTokens, 24 * 60 * 60 * 1000);

//server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

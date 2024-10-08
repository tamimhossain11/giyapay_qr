import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Sequelize } from 'sequelize';
import authRoutes from './middleware/auth.js';
import userRoutes from './Routes/userRoutes.js';
import adminRoutes from './Routes/adminRoutes.js';
import branchesRoutes from './Routes/branchesRoutes.js';
import BlacklistedToken from './model/blacklistedTokenModel.js';
import qrCodesRoute from './Routes/qrCodesRoutes.js';
import bodyParser from 'body-parser';
import http from 'http';
import { Server } from 'socket.io';
import uploadRoutes from './Routes/uploadRoutes.js'
import { authenticateToken } from './middleware/authenticate.js';
import User from './model/userModel.js';



const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.CORS_ORIGIN,
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
app.use('/upload', uploadRoutes);

// User count route based on admin_id or user_id (for Co-Admin or Admin)
app.get('/user/count', authenticateToken, async (req, res) => {
  try {
    const { userType, id, admin_id } = req.user; // Destructure user info from token

    let adminId;
    if (userType === 'admin') {
      adminId = id; // Admin is matched by their own id
    } else if (userType === 'Co-Admin' && admin_id) {
      adminId = admin_id; // Co-Admin is matched by the associated admin_id
    } else {
      return res.status(400).json({ Status: false, Error: 'Admin ID is missing' });
    }

    // Query to count users associated with the adminId (based on userType)
    const userCount = await User.count({
      where: {
        [Sequelize.Op.or]: [
          { id: adminId }, // If the user is an admin, count by their own user_id
          { admin_id: adminId } // If the user is a co-admin, count users under that admin_id
        ]
      }
    });

    return res.json({ Status: true, Result: userCount });
  } catch (error) {
    console.error('Error counting users:', error);
    return res.status(500).json({ Status: false, Error: 'Internal server error' });
  }
});


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

// Socket.IO connection event
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Store the io instance in app
  app.set('socketio', io);

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Server listening
server.listen(3000, () => {
  console.log('Server is running on port 3000');
});

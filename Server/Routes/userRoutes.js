import express from 'express';
import { authenticateToken } from '../middleware/authenticate.js';
import {
  getProfile,
  addUser,
  getAllUsers,
  updateUserStatus,
  updateUser,
  getSingleUser,
  deleteUser,
  getBranchUserCount,
  getCoAdminCount,
  checkBranchAssignment,
  checkUserTypeAndAssignment
} from '../controller/userController.js';

const router = express.Router();

router.get('/branch/:branchId', checkBranchAssignment);

// Define user routes and attach appropriate controller functions
router.get('/profile', authenticateToken, getProfile);
router.post('/add', addUser);
router.get('/all', getAllUsers);
router.put('/edit_status/:id', updateUserStatus);
router.put('/edit/:id', updateUser);
router.get('/:id', getSingleUser);
router.delete('/delete/:id', deleteUser);
router.get('/branchUserCount', (req, res, next) => {
  console.log('Received request for branch user count');
  getBranchUserCount(req, res, next);
});

router.get('/co-admin-count', (req, res, next) => {
  console.log('Received request for co-admin count');
  getCoAdminCount(req, res, next);
});

router.post('/check-user-type', checkUserTypeAndAssignment);

export default router;

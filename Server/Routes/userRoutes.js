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
  checkBranchAssignment,
  checkUserTypeAndAssignment,
  getAllUsersCA
} from '../controller/userController.js';

const router = express.Router();

router.get('/branch/:branchId', checkBranchAssignment);

// Define user routes and attach appropriate controller functions
router.get('/profile', authenticateToken, getProfile);
router.post('/add', addUser);
router.get('/all',authenticateToken, getAllUsers);
router.get('/coadmin_all',authenticateToken, getAllUsersCA);
router.put('/edit_status/:id', updateUserStatus);
router.put('/edit/:id', updateUser);
router.get('/:id', getSingleUser);
router.delete('/delete/:id', deleteUser);
router.post('/check-user-type', checkUserTypeAndAssignment);



export default router;

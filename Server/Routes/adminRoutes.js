import express from 'express';
import { addAdmin, countAdmins, getAllAdmins } from '../controller/adminController.js';

const router = express.Router();

// Route for adding an admin
router.post('/add', addAdmin);

// Route for counting admins
router.get('/count', countAdmins);

//get list
router.get('/all', getAllAdmins);

export default router;

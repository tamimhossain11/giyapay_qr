import express from 'express';
import { addAdmin, countAdmins, getAllAdmins,adminEmailCheck } from '../controller/adminController.js';

const router = express.Router();

// Route for adding an admin
router.post('/add', addAdmin);

// Route for counting admins
router.get('/count', countAdmins);

//get list
router.get('/all', getAllAdmins);

//email check

router.get('/check-email/:email', adminEmailCheck)

export default router;

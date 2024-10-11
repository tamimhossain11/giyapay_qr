import express from 'express';
import { createBranch, 
         getAllBranches,
         getAllBranchesCA, 
         deleteBranch, 
         updateBranchStatus, 
         getBranchCount, 
         editBranch, 
         getBranchById,
        existingBranch } from '../controller/branchController.js';
import { authenticateToken } from '../middleware/authenticate.js';

const router = express.Router();

// Route definitions
router.post('/', createBranch);
router.get('/all', authenticateToken, getAllBranches);
router.get('/coadmin_all', authenticateToken, getAllBranchesCA);
router.delete('/:id', deleteBranch);
router.put('/:id/status', updateBranchStatus);
router.get('/count',authenticateToken, getBranchCount);
router.put('/edit/:id', editBranch); 
router.get('/:id', getBranchById);
router.get('/check-name/:branch_name',existingBranch);


export default router;

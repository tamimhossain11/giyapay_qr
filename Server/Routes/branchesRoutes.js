import express from 'express';
import { createBranch, getAllBranches, deleteBranch, updateBranchStatus, getBranchCount, editBranch, getBranchById } from '../controller/branchController.js';

const router = express.Router();

// Route definitions
router.post('/', createBranch);
router.get('/all', getAllBranches);
router.delete('/:id', deleteBranch);
router.put('/:id/status', updateBranchStatus);
router.get('/count', getBranchCount);
router.put('/edit/:id', editBranch); 
//get branch by id
router.get('/:id', getBranchById);


export default router;

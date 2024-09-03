import Branch from '../model/branchModel.js';
import User from '../model/userModel.js';

// Create a new branch
export const createBranch = async (req, res) => {
  const { branchName, bankName, bankBranch, branchUserId } = req.body;

  try {
    const branch = await Branch.create({
      branch_name: branchName,
      bank_name: bankName,
      bank_branch: bankBranch,
    });

    if (branchUserId) {
      const user = await User.findByPk(branchUserId);
      if (user) {
        user.branch_id = branch.id;
        await user.save();
      }
    }

    res.status(201).json(branch);
  } catch (error) {
    console.error("Error creating branch:", error);
    res.status(500).json({ error: "Failed to create branch" });
  }
};

// Get all branches
export const getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.findAll();
    res.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a branch
export const deleteBranch = async (req, res) => {
  const { id } = req.params;
  try {
    await Branch.destroy({ where: { id } });
    res.json({ message: "Branch deleted successfully" });
  } catch (error) {
    console.error("Error deleting branch:", error);
    res.status(500).json({ error: "Failed to delete branch" });
  }
};

// Update branch status
export const updateBranchStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const branch = await Branch.findByPk(id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    branch.status = status;
    await branch.save();

    res.json({ message: 'Branch status updated successfully', branch });
  } catch (error) {
    console.error('Error updating branch status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Fetch a single branch by ID
export const getBranchById = async (req, res) => {
  const { id } = req.params;

  try {
    const branch = await Branch.findByPk(id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.json(branch);
  } catch (error) {
    console.error('Error fetching branch:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Edit a branch
export const editBranch = async (req, res) => {
  const { id } = req.params;
  const { branch_name, bank_name, bank_branch } = req.body;

  try {
    const branch = await Branch.findByPk(id);

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    branch.branch_name = branch_name;
    branch.bank_name = bank_name;
    branch.bank_branch = bank_branch;
    await branch.save();

    res.json({ message: 'Branch updated successfully', branch });
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({ message: 'Failed to update branch' });
  }
};

//Count

export const getBranchCount = async (req, res) => {
  try {
    const count = await Branch.count();
    res.json({ Status: true, Result: count });
  } catch (error) {
    console.error('Error counting branches:', error);
    res.status(500).json({ Status: false, error: 'Internal server error' });
  }
};
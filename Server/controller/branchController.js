import Branch from '../model/branchModel.js';
import User from '../model/userModel.js';

// Create a new branch
export const createBranch = async (req, res) => {
  const { branchName, bankName, bankBranch, branchUserId, adminId } = req.body; 

  try {
    // Check if the branch name already exists
    const existingBranch = await Branch.findOne({ where: { branch_name: branchName } });
    if (existingBranch) {
      return res.status(400).json({ error: 'Branch name already exists' });
    }

    const branch = await Branch.create({
      branch_name: branchName,
      bank_name: bankName,
      bank_branch: bankBranch,
      admin_id: adminId,
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



// Get branches based on the logged-in admin
export const getAllBranches = async (req, res) => {
  try {
    const adminId = req.user.id;  
    const branches = await Branch.findAll({
      where: {
        admin_id: adminId 
      }
    });
    res.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//get all branch for co admins qr page

export const getAllBranchesCA = async (req, res) => {
  try {
    const { userType, admin_id } = req.user;
    
    if (!admin_id) {
      return res.status(400).json({ message: 'Admin ID is missing' });
    }

    let whereConditions = {};

    // Admins and Co-Admins should both have access to branches linked to their admin_id
    if (userType === 'admin' || userType === 'Co-Admin') {
      whereConditions = {
        admin_id: admin_id, 
      };
    } else {
      return res.status(403).json({ message: 'You do not have the appropriate permissions to view this data' });
    }

    // Fetch branches linked to the admin or co-admin
    const branches = await Branch.findAll({
      where: whereConditions,
    });

    res.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Delete a branch with associated user check
export const deleteBranch = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if the branch has any users associated with it
    const users = await User.findAll({ where: { branch_id: id } });
    if (users.length > 0) {
      return res.status(400).json({ message: "Cannot delete branch because there are users associated with it. Please delete the users first." });
    }

    // If no users are associated, delete the branch
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
    const { userType, id, admin_id } = req.user; 

    let adminId;
    if (userType === 'admin') {
      adminId = id; 
    } else if (userType === 'Co-Admin' && admin_id) {
      adminId = admin_id; 
    } else {
      return res.status(400).json({ Status: false, Error: 'Admin ID is missing' });
    }

    // Query to count branches associated with the adminId
    const count = await Branch.count({
      where: { admin_id: adminId } 
    });

    res.json({ Status: true, Result: count });
  } catch (error) {
    console.error('Error in getBranchCountByAdmin:', error);
    res.status(500).json({ Status: false, Error: 'Internal server error' });
  }
};

export const existingBranch = async (req, res) => {
  try {
    const { branch_name } = req.params;
    const branch = await Branch.findOne({ where: { branch_name } });

    if (branch) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking admin email:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

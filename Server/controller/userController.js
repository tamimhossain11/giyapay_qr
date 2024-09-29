import bcrypt from 'bcryptjs';
import models from '../model/index.js';
import Admin from '../model/adminModel.js';
import sequelize from '../databse/connection.js';

const { User, Branch } = models;

// Controller function to get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;

    if (userType === 'admin') {
      const admin = await Admin.findByPk(userId, {
        attributes: ['id', 'email'],
      });

      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      res.json(admin);
    } else {
      const user = await User.findByPk(userId, {
        include: {
          model: Branch,
          as: 'branch',
          attributes: ['branch_name'],
        },
        attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'user_type', 'status', 'branch_id'],
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    }
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
  }
};


// Controller function to add a user
export const addUser = async (req, res) => {
  const { firstName, lastName, username, email, password, userType, branchId } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !username || !email || !password || !userType) {
    return res.status(400).json({ error: 'All fields are required except branchId' });
  }

  try {
    // Check if branchId is provided and if the branch exists
    if (branchId) {
      const branch = await Branch.findByPk(branchId);
      if (!branch) {
        return res.status(404).json({ error: 'Branch not found' });
      }
    }

    // Hash password before storing it
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create the new user
    const user = await User.create({
      first_name: firstName,
      last_name: lastName,
      username,
      email,
      password: hashedPassword,
      user_type: userType,
      branch_id: branchId || null,
    });

    // Respond with success
    res.status(201).json({ message: 'User added successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Controller function to get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: {
        model: Branch,
        as: 'branch',
        attributes: ['branch_name'],
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function to update user status
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    await user.save();
    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { first_name, last_name, username, email, user_type, branch_id, status, password } = req.body;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only update fields that are provided in the request body
    const updatedFields = {
      ...(first_name && { first_name }),
      ...(last_name && { last_name }),
      ...(username && { username }),
      ...(email && { email }),
      ...(user_type && { user_type }),
      ...(branch_id !== undefined && { branch_id }),
      ...(status !== undefined && { status }),
    };

    // Password should only be updated if it's provided and non-empty
    if (password && password.trim() !== '') {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updatedFields.password = hashedPassword;
    }

    // Update the user with the new fields
    await user.update(updatedFields);

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'An error occurred while updating the user' });
  }
};




// Controller function to get a single user
export const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function to delete a user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function to get branch user count
export const getBranchUserCount = async (req, res) => {
  try {
    const count = await User.count({ where: { user_type: 'Branch User' } });
    res.json({ Status: true, Result: count });
  } catch (error) {
    res.status(500).json({ Status: false, Error: 'Internal server error' });
  }
};


// Controller function to get co-admin count
export const getCoAdminCount = async (req, res) => {
  try {
    const count = await User.count({ where: { user_type: 'Co-Admin' } });
    res.json({ Status: true, Result: count });
  } catch (error) {
    res.status(500).json({ Status: false, Error: 'Internal server error' });
  }
};


// Controller to check if a branch is assigned to a user
export const checkBranchAssignment = async (req, res) => {
  const { branchId } = req.params;

  try {
    // Find if a user is already assigned to the given branchId
    const user = await User.findOne({
      where: { branch_id: branchId },
    });

    // If a user is found, return the user's details; otherwise, return null
    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(200).json(null);
    }
  } catch (error) {
    console.error('Error checking branch assignment:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


// Check if user is Co-Admin or already assigned to a branch
export const checkUserTypeAndAssignment = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user is a Co-Admin
    if (user.user_type === 'Co-Admin') {
      return res.json({ isCoAdmin: true, alreadyAssigned: false });
    }

    // Check if the user is already assigned to a branch (if Branch User)
    if (user.user_type === 'Branch User' && user.branch_id) {
      return res.json({ isCoAdmin: false, alreadyAssigned: true });
    }

    res.json({ isCoAdmin: false, alreadyAssigned: false });
  } catch (error) {
    console.error('Error checking user type or assignment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


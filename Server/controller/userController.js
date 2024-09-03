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
        attributes: ['first_name', 'last_name', 'username', 'email', 'user_type', 'status', 'branch_id'],
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

  if (!firstName || !lastName || !username || !email || !password || !userType) {
    return res.status(400).json({ error: 'All fields are required except branchId' });
  }

  try {
    if (branchId) {
      const branch = await Branch.findByPk(branchId);
      if (!branch) {
        return res.status(404).json({ error: 'Branch not found' });
      }

      const existingUser = await User.findOne({ where: { branch_id: branchId } });
      if (existingUser) {
        return res.status(400).json({ error: 'This branch already has an assigned user' });
      }
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await User.create({
      first_name: firstName,
      last_name: lastName,
      username,
      email,
      password: hashedPassword,
      user_type: userType,
      branch_id: branchId || null,
    });

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

// Controller function to update user details
export const updateUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { firstName, lastName, username, password, userType, branch_id, status } = req.body;

    const user = await User.findByPk(id, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    if (firstName) user.first_name = firstName;
    if (lastName) user.last_name = lastName;
    if (username) user.username = username;
    if (userType) user.user_type = userType;
    if (status) user.status = status;

    if (branch_id) {
      const branch = await Branch.findByPk(branch_id, { transaction });
      if (!branch) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Branch not found' });
      }

      const existingUser = await User.findOne({ where: { branch_id }, transaction });
      if (existingUser && existingUser.id !== id) {
        await transaction.rollback();
        return res.status(400).json({ error: 'This branch already has an assigned user' });
      }

      user.branch_id = branch_id;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save({ transaction });
    await transaction.commit();
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating user:', error.message);
    res.status(500).json({ message: 'Internal server error' });
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

import bcrypt from 'bcryptjs';
import models from '../model/index.js';
import Admin from '../model/adminModel.js';
import { Op } from 'sequelize';

const { User, Branch } = models;

// Controller function to get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userType = req.user?.userType;

    if (!userId) {
      console.error("Error: No user ID found in the request.");
      return res.status(400).json({ message: "User ID is required." });
    }

    console.log("Fetching profile for user ID:", userId);
    
    if (userType === 'admin') {
      const admin = await Admin.findByPk(userId, {
        attributes: ['id', 'email', 'merchant_id','merchant_name', 'merchant_secret','paymentUrl', 'payment_method', 'gateway_account_type'],
      });

      if (!admin) {
        console.error("Error: Admin not found for user ID:", userId);
        return res.status(404).json({ message: 'Admin not found' });
      }

      res.json(admin); // Respond with admin details, including merchant_name and merchant_secret
    } else {
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Branch,
            as: 'branch',
            attributes: ['branch_name'],
          },
          {
            model: Admin,
            as: 'admin', // Include admin details
            attributes: ['id','merchant_id', 'merchant_secret','email','paymentUrl', 'payment_method', 'gateway_account_type'],
          },
        ],
        attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'user_type', 'status', 'branch_id'],
      });

      if (!user) {
        console.error("Error: User not found for user ID:", userId);
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    }
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
  }
};





export const addUser = async (req, res) => {
  const { firstName, lastName, username, email, password, userType, branchId, adminId } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !username || !email || !password || !userType || !adminId) {
    return res.status(400).json({ error: 'All fields are required except branchId' });
  }

  try {
    // Check for duplicate username and email in both User and Admin tables
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        error: `User with the same ${existingUser.username === username ? 'username' : 'email'} already exists.`,
      });
    }

    // Check if email already exists in the Admin table
    const existingAdmin = await Admin.findOne({
      where: { email }
    });

    if (existingAdmin) {
      return res.status(400).json({
        error: 'An admin with the same email already exists.',
      });
    }

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
      admin_id: adminId,
    });

    // Respond with success
    res.status(201).json({ message: 'User added successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Controller function to get all users based on admin_id
export const getAllUsers = async (req, res) => {
  try {
    const adminId = req.user.id; 

    const users = await User.findAll({
      where: { admin_id: adminId }, 
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

//get all user for co admins qr code page


export const getAllUsersCA = async (req, res) => {
  try {
    const { userType, admin_id } = req.user;  // Assuming the token provides userType and admin_id
    
    if (!admin_id) {
      return res.status(400).json({ message: 'Admin ID is missing' });
    }

    let whereConditions = {};

    // Admins and Co-Admins should both have access to users linked to their admin_id
    if (userType === 'admin' || userType === 'Co-Admin') {
      whereConditions = {
        admin_id: admin_id, // Fetch users linked to this admin or co-admin's admin_id
      };
    } else {
      return res.status(403).json({ message: 'You do not have the appropriate permissions to view this data' });
    }

    // Fetch users along with their associated branch details
    const users = await User.findAll({
      where: whereConditions,
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

  // Validate required fields
  if (!first_name || !last_name || !username || !email) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if the username is already taken (excluding the current user)
    const usernameExists = await User.findOne({ where: { username, id: { [Op.ne]: userId } } });
    if (usernameExists) {
      return res.status(400).json({ error: 'Username is already in use.' });
    }

    // Check if the email is already taken (check both User and Admin tables)
    const emailExistsInUser = await User.findOne({ where: { email, id: { [Op.ne]: userId } } });
    const emailExistsInAdmin = await Admin.findOne({ where: { email } });
    if (emailExistsInUser || emailExistsInAdmin) {
      return res.status(400).json({ error: 'Email is already in use.' });
    }

    // Only update fields that are provided
    const updatedFields = {
      ...(first_name && { first_name }),
      ...(last_name && { last_name }),
      ...(username && { username }),
      ...(email && { email }),
      ...(user_type && { user_type }),
      ...(branch_id !== undefined && { branch_id }),
      ...(status !== undefined && { status }),
    };

    // Password should only be updated if provided
    if (password && password.trim() !== '') {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updatedFields.password = hashedPassword;
    }

    // Update the user with new data
    await user.update(updatedFields);

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'An error occurred while updating the user.' });
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


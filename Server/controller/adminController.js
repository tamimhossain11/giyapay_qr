import bcrypt from 'bcryptjs';
import Admin from '../model/adminModel.js';

// Controller for adding an admin
export const addAdmin = async (req, res) => {
    const { email, password, merchant_name, merchant_secret } = req.body;

    if (!email || !password || !merchant_name || !merchant_secret) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);

        await Admin.create({
            email,
            password: hashedPassword,
            merchant_name,
            merchant_secret,
        });

        res.status(201).json({ message: 'Admin added successfully' });
    } catch (error) {
        console.error('Error adding admin:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Controller for counting admins
export const countAdmins = async (req, res) => {
    try {
        const count = await Admin.count();
        res.json({ Status: true, Result: count });
    } catch (error) {
        console.error('Error counting admins:', error);
        res.status(500).json({ Status: false, error: 'Internal server error' });
    }
};

//List of admins
export const getAllAdmins = async (req, res) => {
    try {
      const admins = await Admin.findAll({
        attributes: ['id', 'email', 'merchant_name', 'merchant_secret'], // Select only necessary fields
      });
  
      if (!admins || admins.length === 0) {
        return res.status(404).json({ Status: false, Message: 'No admins found' });
      }
  
      return res.status(200).json({
        Status: true,
        Result: admins,
        Message: 'Admin data retrieved successfully',
      });
    } catch (error) {
      console.error('Error fetching admins:', error);
      return res.status(500).json({
        Status: false,
        Message: 'Server error while fetching admin data',
      });
    }
  };
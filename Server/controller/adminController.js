import bcrypt from 'bcryptjs';
import Admin from '../model/adminModel.js';

// Controller for adding an admin
export const addAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);

        await Admin.create({
            email,
            password: hashedPassword
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

import bcrypt from 'bcryptjs';
import Admin from '../model/adminModel.js';

// Controller for adding an admin
export const addAdmin = async (req, res) => {
  const { email, password, merchant_name, merchant_secret, merchant_id, paymentUrl,merchant_url, payment_method, gateway_account_type } = req.body;

  if (!email || !password || !merchant_name || !merchant_secret || !merchant_id || !paymentUrl|| !merchant_url || !gateway_account_type) {
    return res.status(400).json({ error: 'Email, password, and other fields are required' });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);

    const newAdmin = await Admin.create({
      email,
      password: hashedPassword,
      merchant_id,
      merchant_secret,
      merchant_name,
      paymentUrl,
      merchant_url,
      payment_method: payment_method || null,
      gateway_account_type,
    });

    const io = req.app.get('socketio');
    const admins = await Admin.findAll({
      attributes: ['id', 'email', 'merchant_id', 'merchant_name', 'merchant_secret', 'paymentUrl','merchant_url', 'payment_method', 'gateway_account_type'], // Select only necessary fields
    });
    io.emit('adminListUpdated', admins); 

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


// Controller for listing all admins 
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: ['id', 'email', 'merchant_id', 'merchant_secret', 'merchant_name','paymentUrl','merchant_url', 'payment_method', 'gateway_account_type'],
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

export const adminEmailCheck = async (req, res) => {
  try {
    const { email } = req.params;
    const admin = await Admin.findOne({ where: { email } });

    if (admin) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking admin email:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};


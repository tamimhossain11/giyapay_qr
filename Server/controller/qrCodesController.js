import { Op } from 'sequelize';
import models from '../model/index.js';
const { QrCode, User, Branch } = models;

const createQrCode = async (req, res) => {
  try {
    const { branch_id, amount, qr_code, invoice_number, payment_channel, signature, nonce, description } = req.body;

    if (!branch_id || !amount || !qr_code || !invoice_number || !payment_channel || !signature || !nonce || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const branch = await Branch.findByPk(branch_id);
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    const user = await User.findOne({ where: { branch_id: branch.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found for this branch' });
    }

    const qrCode = await QrCode.create({
      branch_id,
      user_id: user.id,
      amount,
      qr_code,
      invoice_number,
      payment_channel,
      signature,
      nonce,
      description,
    });

    res.status(201).json({ message: 'QR code created successfully', qrCode });
  } catch (error) {
    console.error('Error creating QR code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const handleCallback = async (req, res) => {
  try {
    console.log('Received callback request:', req.body);

    const { nonce, refno, amount, signature, invoice_number } = req.body;
    const callbackType = req.params.callbackType;

    if (!nonce || !refno || !amount || !signature || !invoice_number) {
      console.error('Invalid data provided:', req.body);
      return res.status(400).json({ message: 'Invalid data provided' });
    }

    // Find the QR code entry by invoice number
    const qrCode = await QrCode.findOne({ where: { invoice_number } });

    if (!qrCode) {
      console.error('QR Code not found for invoice number:', invoice_number);
      return res.status(404).json({ message: 'QR Code not found' });
    }

    const updateData = {
      amount,
      payment_reference: refno,
    };

    switch (callbackType) {
      case 'success-callback':
        updateData.status = 'Paid';
        break;
      case 'error-callback':
        updateData.status = 'Failed';
        break;
      case 'cancel-callback':
        updateData.status = 'Cancelled';
        break;
      default:
        updateData.status = 'Unknown';
        break;
    }

    // Update QR code and allow Sequelize to handle the updated_at timestamp
    await qrCode.update(updateData);

    console.log('QR Code updated successfully:', qrCode);
    res.status(200).json({ message: 'QR Code updated successfully', qrCode });
  } catch (error) {
    console.error('Error handling callback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



const getAllQrCodes = async (req, res) => {
  try {
    const qrCodes = await QrCode.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'branch_id'],
          include: {
            model: Branch,
            as: 'branch',
            attributes: ['branch_name'],
          },
        },
      ],
    });    
    res.json(qrCodes);
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    res.status(500).json({ error: 'Error fetching QR codes' });
  }
};


const getQrCodeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Add default conditions or empty objects if no conditions are passed
    const userConditions = {}; 
    const branchConditions = {};

    const qrCode = await QrCode.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username'],
          where: Object.keys(userConditions).length > 0 ? userConditions : undefined,
          required: false 
        },
        {
          model: Branch,
          as: 'branch',
          attributes: ['branch_name'],
          where: Object.keys(branchConditions).length > 0 ? branchConditions : undefined,
          required: false 
        },
      ],
    });

    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    res.json(qrCode);
  } catch (error) {
    console.error('Error fetching QR code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//check_invoice

const checkInvoice = async (req, res) => {
  try {
    const { invoice_number } = req.params;

    if (!invoice_number) {
      return res.status(400).json({ error: 'Invoice number is required' });
    }

    const qrCode = await QrCode.findOne({ where: { invoice_number } });

    if (!qrCode) {
      return res.status(404).json({ status: false });
    }

    res.json({ status: true });
  } catch (error) {
    console.error('Error checking invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getFilteredQrCodes = async (req, res) => {
  const { searchTerm, branchFilter, userFilter, startDate, endDate } = req.query;

  try {
    // Prepare general conditions for the main QrCode model
    const whereConditions = {
      ...(searchTerm && { payment_reference: { [Op.like]: `%${searchTerm}%` } }),
      ...(startDate && endDate && {
        createdAt: { [Op.between]: [startDate, endDate] },
      }),
    };

    // Prepare optional user filter
    const userConditions = {
      ...(userFilter && { username: { [Op.like]: `%${userFilter}%` } }),
    };

    // Prepare optional branch filter
    const branchConditions = {
      ...(branchFilter && { branch_name: { [Op.like]: `%${branchFilter}%` } }),
    };

    // Fetch all QR codes, including associated User and Branch data
    const qrCodes = await QrCode.findAll({
      where: whereConditions, 
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username'],
          where: Object.keys(userConditions).length > 0 ? userConditions : undefined, 
        },
        {
          model: Branch,
          as: 'branch',
          attributes: ['branch_name'], 
          where: Object.keys(branchConditions).length > 0 ? branchConditions : undefined, 
        },
      ],
      attributes: ['createdAt', 'updatedAt', 'amount', 'payment_reference', 'status', 'description','qr_code', 'id'], 
    });

    // Send the data back as JSON
    res.status(200).json(qrCodes);
  } catch (error) {
    console.error('Error fetching QR codes: ', error);
    res.status(500).json({ error: 'Failed to fetch QR codes' });
  }
};



export { createQrCode, handleCallback, getAllQrCodes, getQrCodeById, checkInvoice, getFilteredQrCodes };

import { Op } from 'sequelize';
import models from '../model/index.js';
const { QrCode, User, Branch ,Admin } = models;
import crypto from "crypto";

const createQrCode = async (req, res) => {
  try {
    const {
      branch_id,
      user_id,
      amount,
      qr_code,
      invoice_number,
      payment_channel,
      signature,
      nonce,
      description,
      admin_id,
      timestamp,
    } = req.body;

    // Validate that all fields are present
    if (
      !branch_id ||
      !user_id ||
      !amount ||
      !qr_code ||
      !invoice_number ||
      !payment_channel ||
      !signature ||
      !nonce ||
      !description ||
      !admin_id ||
      !timestamp
    ) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be a valid positive number.' });
    }

    const branch = await Branch.findByPk(branch_id);
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found. Please check the branch ID.' });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please check the user ID.' });
    }

    const existingInvoice = await QrCode.findOne({ where: { invoice_number } });
    if (existingInvoice) {
      return res.status(409).json({ error: 'Invoice number already exists. Please choose a different one.' });
    }

    // Create the QR code record
    const qrCode = await QrCode.create({
      branch_id,
      user_id,
      amount,
      qr_code,
      invoice_number,
      payment_channel,
      signature,
      nonce,
      description,
      admin_id,
      timestamp,
    });

    // Success response with created QR code details
    res.status(201).json({
      message: 'QR code created successfully!',
      qrCode,
    });
  } catch (error) {
    console.error('Error creating QR code:', error);
    res.status(500).json({
      error: 'Internal server error. Please try again later.',
    });
  }
};

//Under fix
const handleCallback = async (req, res) => {
  try {
    console.log("Received callback request:", req.body);

    const { nonce, refno, amount, invoice_number, timestamp, id } = req.body; // 'id' is the admin ID
    const callbackType = req.params.callbackType;

    if (!nonce || !refno || !amount || !invoice_number || !timestamp || !id) {
      console.error("Invalid data provided:", req.body);
      return res.status(400).json({ message: "Invalid data provided" });
    }

    // Find QR Code
    const qrCode = await QrCode.findOne({ where: { invoice_number } });

    if (!qrCode) {
      console.error("QR Code not found for invoice number:", invoice_number);
      return res.status(404).json({ message: "QR Code not found" });
    }

    // Prevent duplicate processing
    if (["Failed", "Cancelled"].includes(qrCode.status)) {
      console.log("Transaction already processed:", qrCode.status);
      return res.status(200).json({ message: "Transaction already processed", qrCode });
    }

    // Update Status
    const updateData = {
      amount,
      payment_reference: refno,
    };

    switch (callbackType) {
      case "error-callback":
        updateData.status = "Failed";
        break;
      case "cancel-callback":
        updateData.status = "Cancelled";
        break;
      default:
        updateData.status = "Unknown";
        break;
    }

    await qrCode.update(updateData);

    console.log("QR Code updated successfully:", qrCode);

    const io = req.app.get("socketio");
    io.emit("qr-code-updated", { qrCode });

    res.status(200).json({ message: "QR Code updated successfully", qrCode });
  } catch (error) {
    console.error("Error handling callback:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default handleCallback;


const handleSuccessCallback = async (req, res) => {
  try {
    const { callbackUrl } = req.body;

    if (!callbackUrl) {
      return res.status(400).json({ message: "Callback URL is missing" });
    }

    // Extract parameters from callback URL
    const url = new URL(callbackUrl);
    const params = new URLSearchParams(url.search);

    const refno = params.get("refno");
    const amountInCents = params.get("amount");
    const invoice_number = params.get("invoice_number");
    const id = params.get("id"); // Admin ID from URL
    const callbackSignature = params.get("signature"); // Signature from Giyapay

    if (!refno || !amountInCents || !invoice_number || !id || !callbackSignature) {
      return res.status(400).json({ message: "Invalid callback parameters" });
    }

    // Fetch admin secret key from the database
    const admin = await Admin.findOne({ where: { id } });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const secretKey = admin.merchant_secret; // Use admin's secret key

    // Extracting the part of URL that needs to be hashed
    const toBeHashed = callbackUrl.split("&signature=");
    const myStringForHashing = `${toBeHashed[0]}${secretKey}`; // Remove `()` // Append secret key

    // Hashing with SHA512
    const computedSignature = crypto.createHash("sha512").update(myStringForHashing).digest("hex");

    console.log("Computed Signature:", computedSignature);
    console.log("Callback Signature:", callbackSignature);

    if (computedSignature !== callbackSignature) {
      return res.status(401).json({ message: "Signature verification failed" });
    }

    // Convert amount from cents to standard currency
    const amount = (parseFloat(amountInCents) / 100).toFixed(2);

    // Check if transaction exists
    const existingTransaction = await QrCode.findOne({ where: { invoice_number } });

    if (!existingTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (existingTransaction.status === "paid") {
      return res.status(200).json({ message: "Transaction already processed" });
    }

    // Update transaction status
    await QrCode.update(
      { status: "paid", amount, payment_reference: refno },
      { where: { id: existingTransaction.id } }
    );

    return res.status(200).json({
      message: "Transaction verified and updated successfully",
      amount,
      refno,
    });
  } catch (error) {
    console.error("Error verifying callback:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getAdminQrCodes = async (req, res) => {
  try {
    console.log('User in Request:', req.user);
    
    const adminId = req.user.id; 

    const qrCodes = await QrCode.findAll({
      where: { admin_id: adminId }, 
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'branch_id', 'admin_id'],
          required: true,
        },
        {
          model: Branch,
          as: 'branch',
          attributes: ['branch_name'],
          required: true,
        },
      ]
    });

    return res.json(qrCodes);

  } catch (error) {
    console.error('Error fetching QR codes:', error);
    return res.status(500).json({ error: 'Error fetching QR codes' });
  }
};



const getQrCodesBU = async (req, res) => {
  try {
    const { admin_id } = req.user; 

    let filterCondition = {};  

    filterCondition = { admin_id: admin_id };
    // Fetch QR codes based on the filter condition
    const qrCodes = await QrCode.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'branch_id', 'admin_id'],
          where: filterCondition  
        },
        {
          model: Branch, 
          as: 'branch',
          attributes: ['branch_name'], 
        },
      ],
    });

    return res.json(qrCodes);

  } catch (error) {
    console.error('Error fetching QR codes:', error);
    return res.status(500).json({ error: 'Error fetching QR codes' });
  }
};


//Filtered qr for CA
const getFilteredQrCodesCA = async (req, res) => {
  const { searchTerm, branchFilter, userFilter, startDate, endDate } = req.query;
  
  const { userType, admin_id } = req.user;

  if (!admin_id) {
    return res.status(400).json({ error: 'Admin ID is missing from the request' });
  }

  try {
    const whereConditions = {
      ...(searchTerm && { payment_reference: { [Op.like]: `%${searchTerm}%` } }),
      ...(startDate && endDate && { createdAt: { [Op.between]: [startDate, endDate] } }),
      admin_id: admin_id,  
    };

    const userConditions = {
      ...(userFilter && { username: { [Op.like]: `%${userFilter}%` } }),
    };

    const branchConditions = {
      ...(branchFilter && { branch_name: { [Op.like]: `%${branchFilter}%` } }),
    };

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
      attributes: ['createdAt', 'updatedAt', 'amount', 'payment_reference', 'status', 'description', 'qr_code', 'id'], 
    });

    res.status(200).json(qrCodes);
  } catch (error) {
    console.error('Error fetching QR codes: ', error);
    res.status(500).json({ error: 'Failed to fetch QR codes' });
  }
};

//Filtered qr for admin
const getFilteredQrCodes = async (req, res) => {
  const { searchTerm, branchFilter, userFilter, startDate, endDate } = req.query;

  const adminId = req.user.id;

  if (!adminId) {
    return res.status(400).json({ error: 'Admin ID is missing from the request' });
  }

  try {
    const whereConditions = {
      ...(searchTerm && { payment_reference: { [Op.like]: `%${searchTerm}%` } }),
      ...(startDate && endDate && {
        createdAt: { [Op.between]: [startDate, endDate] },
      }),
      admin_id: adminId, 
    };
    const userConditions = {
      ...(userFilter && { username: { [Op.like]: `%${userFilter}%` } }),
    };

    const branchConditions = {
      ...(branchFilter && { branch_name: { [Op.like]: `%${branchFilter}%` } }),
    };

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
      attributes: ['createdAt', 'updatedAt', 'amount', 'payment_reference', 'status', 'description', 'qr_code', 'id'], 
    });

    res.status(200).json(qrCodes);
  } catch (error) {
    console.error('Error fetching QR codes: ', error);
    res.status(500).json({ error: 'Failed to fetch QR codes' });
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

// Controller to count QR codes based on admin ID
const countQrCodesByAdmin = async (req, res) => {
  try {
    const { userType, id, admin_id } = req.user; 

    let adminId;
    if (userType === 'admin') {
      adminId = id; 
    } else if (userType === 'Co-Admin' && admin_id) {
      adminId = admin_id; 
    } else {
      return res.status(400).json({ Status: false, message: 'Admin ID is required' });
    }

    console.log(`Counting QR codes for admin ID: ${adminId}`);

    const qrCodeCount = await QrCode.count({
      where: {
        admin_id: adminId, 
      },
    });

    res.json({ Status: true, Result: qrCodeCount });
  } catch (error) {
    console.error('Error counting QR codes:', error);
    res.status(500).json({ Status: false, error: 'Internal server error' });
  }
};

//Api for query the invoice and get pyment refrence and status

const getPaymentDetailsByInvoice = async (req, res) => {
  try {
    const { invoice_number } = req.params; 

    if (!invoice_number) {
      return res.status(400).json({ error: 'Invoice number is required' });
    }

    // Find the QR Code entry by invoice_number
    const qrCode = await QrCode.findOne({
      where: { invoice_number },
      attributes: ['payment_reference', 'status'],
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'Invoice number not found' });
    }

    // Return the payment_reference and status
    res.status(200).json({
      reference_number: qrCode.payment_reference,
      payment_status: qrCode.status,
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




export { 
  createQrCode, 
  handleCallback, 
  getAdminQrCodes,  
  checkInvoice, 
  getFilteredQrCodes,
  getFilteredQrCodesCA, 
  getQrCodesBU  ,
  countQrCodesByAdmin,
  getPaymentDetailsByInvoice,
  handleSuccessCallback
};


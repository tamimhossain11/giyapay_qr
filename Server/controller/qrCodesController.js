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
        updateData.status = 'Success';
        break;
      case 'error-callback':
        updateData.status = 'Error';
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
                    attributes: ['id', 'first_name', 'last_name', 'username'],
                },
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'branch_name'],
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

        const qrCode = await QrCode.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'first_name', 'last_name', 'username'],
                },
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'branch_name'],
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

//Filter
const getFilteredQrCodes = async (req, res) => {
    try {
      const { searchTerm, branchFilter, userFilter, referenceFilter, startDate, endDate } = req.query;
  
      // Building the query dynamically based on provided filters
      const filterConditions = {};
  
      if (searchTerm) {
        filterConditions.paymentReference = {
          [Op.like]: `%${searchTerm}%`,
        };
      }
  
      if (branchFilter) {
        filterConditions.branchId = branchFilter;
      }
  
      if (userFilter) {
        filterConditions.userId = userFilter;
      }
  
      if (referenceFilter) {
        filterConditions.paymentReference = {
          [Op.like]: `%${referenceFilter}%`,
        };
      }
  
      if (startDate && endDate) {
        filterConditions.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      } else if (startDate) {
        filterConditions.createdAt = {
          [Op.gte]: new Date(startDate),
        };
      } else if (endDate) {
        filterConditions.createdAt = {
          [Op.lte]: new Date(endDate),
        };
      }
  
      // Fetch filtered QR codes with associated User and Branch details
      const qrCodes = await QrCode.findAll({
        where: filterConditions,
        include: [
          { model: Branch, attributes: ['name'] },
          { model: User, attributes: ['firstName', 'lastName'] },
        ],
      });
  
      res.json(qrCodes);
    } catch (error) {
      console.error('Error fetching filtered QR codes:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

export { createQrCode, handleCallback, getAllQrCodes, getQrCodeById,checkInvoice,getFilteredQrCodes };

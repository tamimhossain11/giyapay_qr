import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import QRCode from 'react-qr-code';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';

const AddQr = () => {
  const [formData, setFormData] = useState({
    branch_name: '',
    invoice_number: '',
    amount: '',
  });
  const [generatedQrCode, setGeneratedQrCode] = useState('');
  const [showFields, setShowFields] = useState(true);
  const [userId, setUserId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndBranchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userResponse = await axios.get('http://localhost:3000/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = userResponse.data;

        if (user.branch) {
          setFormData((prevData) => ({
            ...prevData,
            branch_name: user.branch.branch_name,
          }));
          setUserId(user.id);
          setBranchId(user.branch_id);
          setUserName(user.username);
        } else {
          console.error('User does not have associated branch data');
        }
      } catch (error) {
        console.error('Error fetching user or branch data:', error);
      }
    };

    fetchUserAndBranchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate invoice number
    if (!isValidInvoiceNumber(formData.invoice_number)) {
      setError('Invalid invoice number. Please use only letters, numbers, and no special characters.');
      return;
    }

    // Check if invoice number already exists
    const invoiceExists = await checkInvoiceNumberExists(formData.invoice_number);
    if (invoiceExists) {
      setError('Invoice number already exists. Please choose a different one.');
      return;
    }

    try {
      const nonce = generateNonce();
      const timestamp = generateTimestamp();
      const amountInCents = (parseFloat(formData.amount) * 100).toFixed(0);

      const signature = generateSignature(
        amountInCents,
        formData.invoice_number,
        nonce,
        timestamp
      );

      const params = {
        success_callback: `http://localhost:5173/callback/success-callback?invoice_number=${formData.invoice_number}`,
        error_callback: `http://localhost:5173/callback/error-callback?invoice_number=${formData.invoice_number}`,
        cancel_callback: `http://localhost:5173/callback/cancel-callback?invoice_number=${formData.invoice_number}`,
        merchant_id: 'merchant1234',
        amount: amountInCents,
        currency: 'PHP',
        nonce,
        timestamp,
        description: `${userName}, ${formData.invoice_number}, ${formData.branch_name}`,
        signature,
        order_id: formData.invoice_number,
        payWith: 'GiyaPay',
        gateway_account_type: 'Individualized',
        payment_method: 'MASTERCARD/VISA',
        merchant_name: 'MR Quicky',
      };

      const checkoutUrl = `https://sandbox.giyapay.com/checkout/?${new URLSearchParams(params).toString()}`;

      // Save the QR code and initiate payment
      await axios.post('http://localhost:3000/api/qr-codes/create', {
        ...formData,
        user_id: userId,
        branch_id: branchId,
        qr_code: checkoutUrl,
        invoice_number: formData.invoice_number,
        payment_channel: 'GiyaPay',
        signature,
        nonce,
        description: params.description,
      });

      setGeneratedQrCode(checkoutUrl);
      setShowFields(false);
    } catch (error) {
      console.error('Error creating QR code or redirecting:', error);
    }
  };

  const handleDone = () => {
    navigate('/branch-dashboard/manage-qr');
  };

  const generateNonce = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

  const generateTimestamp = () => Math.floor(Date.now() / 1000);

  const generateSignature = (amount, invoice_number, nonce, timestamp) => {
    const secretKey = '098f6bcd4621d373cade4e832627b4f6';
    const merchantId = 'merchant1234';
    const currency = 'PHP';

    const myStringForHashing = `${merchantId}${amount}${currency}${invoice_number}${timestamp}${nonce}${secretKey}`;

    return CryptoJS.SHA512(myStringForHashing).toString(CryptoJS.enc.Hex);
  };

  const isValidInvoiceNumber = (invoice_number) => {
    const regex = /^[a-zA-Z0-9]+$/; // Only letters and numbers
    return regex.test(invoice_number);
  };

  const checkInvoiceNumberExists = async (invoice_number) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/qr-codes/check-invoice?invoice_number=${invoice_number}`);
      return response.data.exists; // Backend should return { exists: true/false }
    } catch (error) {
      console.error('Error checking invoice number:', error);
      return false;
    }
  };

  return (
    <Container maxWidth="sm">
      <Box textAlign="center" my={4}>
        {showFields ? (
          <>
            <Typography variant="h4" gutterBottom>Create QR Code</Typography>
            <TextField
              label="Branch"
              name="branch_name"
              value={formData.branch_name}
              fullWidth
              margin="normal"
              disabled
            />
            <TextField
              label="Invoice #"
              name="invoice_number"
              value={formData.invoice_number}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!error}
              helperText={error}
            />
            <TextField
              label="Amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              fullWidth
            >
              Generate QR Code
            </Button>
          </>
        ) : (
          <Box>
            <Typography variant="h4" gutterBottom>Branch</Typography>
            <Typography variant="body1">{formData.branch_name}</Typography>
            <Typography variant="h6" gutterBottom>Invoice #</Typography>
            <Typography variant="body1">{formData.invoice_number}</Typography>
            <Typography variant="h5" gutterBottom>Amount</Typography>
            <Typography variant="h4" color="primary" gutterBottom>
              {formData.amount}
            </Typography>
            <QRCode value={generatedQrCode} />
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDone}
                fullWidth
              >
                Done
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default AddQr;

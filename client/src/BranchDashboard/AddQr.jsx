import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, Divider, Grid } from '@mui/material';
import QRCode from 'react-qr-code';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';

const AddQr = () => {
  const [formData, setFormData] = useState({
    branch_name: '',
    invoice_number: '',
    amount: '',
    user_name: '', // Added field for user name
  });
  const [generatedQrCode, setGeneratedQrCode] = useState('');
  const [showFields, setShowFields] = useState(true);
  const [userId, setUserId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchUserAndBranchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userResponse = await axios.get(`${backendUrl}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const user = userResponse.data;
  
        // Log the user response to inspect the structure
        console.log('User response:', user);
  
        if (user && user.branch) {
          setFormData((prevData) => ({
            ...prevData,
            branch_name: user.branch.branch_name,
            user_name: user.username, // Populate the user name
          }));
          setUserId(user.id); // Ensure user ID is set correctly
          setBranchId(user.branch_id); // Ensure branch ID is set correctly
        } else {
          console.error('User does not have associated branch data');
        }
      } catch (error) {
        console.error('Error fetching user or branch data:', error);
      }
    };
  
    fetchUserAndBranchData();
  }, [backendUrl]);  

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
        success_callback: `${import.meta.env.VITE_FRONTEND_URL}/callback/success-callback?invoice_number=${formData.invoice_number}`,
        error_callback: `${import.meta.env.VITE_FRONTEND_URL}/callback/error-callback?invoice_number=${formData.invoice_number}`,
        cancel_callback: `${import.meta.env.VITE_FRONTEND_URL}/callback/cancel-callback?invoice_number=${formData.invoice_number}`,
        merchant_id: 'merchant1234',
        amount: amountInCents,
        currency: 'PHP',
        nonce,
        timestamp,
        description: `Branch Name: ${formData.branch_name}\nUser Name: ${formData.user_name}\nInvoice Number: ${formData.invoice_number}`,
        signature,
        order_id: formData.invoice_number,
        payWith: 'GiyaPay',
        gateway_account_type: 'Individualized',
        payment_method: 'MASTERCARD/VISA',
        merchant_name: import.meta.env.VITE_MERCHANT_NAME,
      };

      const checkoutUrl = `https://sandbox.giyapay.com/checkout/?${new URLSearchParams(params).toString()}`;

      // Save the QR code and initiate payment
      await axios.post(`${backendUrl}/api/qr-codes/create`, {
        branch_id: branchId,
        user_id: userId,
        amount: formData.amount,
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
    const secretKey = import.meta.env.VITE_MERCHANT_SECRET;
    const merchantId = 'merchant1234';
    const currency = 'PHP';

    const myStringForHashing = `${merchantId}${amount}${currency}${invoice_number}${timestamp}${nonce}${secretKey}`;

    return CryptoJS.SHA512(myStringForHashing).toString(CryptoJS.enc.Hex);
  };

  const isValidInvoiceNumber = (invoice_number) => {
    const regex = /^[a-zA-Z0-9]+$/; 
    return regex.test(invoice_number);
  };

  const checkInvoiceNumberExists = async (invoice_number) => {
    const encodedInvoiceNumber = encodeURIComponent(invoice_number);
    const url = `${backendUrl}/api/qr-codes/check-invoice/${encodedInvoiceNumber}`;
    
    try {
      const response = await axios.get(url);
      return response.data.status; 
    } catch (error) {
      console.error('Error checking invoice number:', error.response ? error.response.data : error.message);
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
              label="User"
              name="user_name"
              value={formData.user_name} 
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
          <Box
          sx={{
            maxWidth: '600px',  // A bit wider for better readability
            margin: 'auto',
            padding: '32px',
            borderRadius: '16px',
            backgroundColor: '#f9f9f9',  // Light gray background for contrast
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',  // Softer shadow for elegance
            textAlign: 'left',  // Align content to the left for better readability
          }}
        >
          {/* Title */}
          <Typography 
            variant="h5" 
            fontWeight="bold" 
            gutterBottom
            sx={{ color: '#333', marginBottom: '24px', textAlign: 'center' }}  // Centered header for focus
          >
            Transaction Details
          </Typography>
    
          {/* Divider for structure */}
          <Divider sx={{ marginBottom: '24px' }} />
    
          {/* Side-by-side layout */}
          <Grid container spacing={2} sx={{ marginBottom: '24px' }}>
            <Grid item xs={6}>
              <Typography variant="subtitle1" sx={{ color: '#666' }}>
                Branch Name:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" fontWeight="500" sx={{ color: '#111' }}>
                {formData.branch_name}
              </Typography>
            </Grid>
    
            <Grid item xs={6}>
              <Typography variant="subtitle1" sx={{ color: '#666' }}>
                Invoice #:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" fontWeight="500" sx={{ color: '#111' }}>
                {formData.invoice_number}
              </Typography>
            </Grid>
    
            <Grid item xs={6}>
              <Typography variant="subtitle1" sx={{ color: '#666' }}>
                Amount (PHP):
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                ₱{formData.amount}
              </Typography>
            </Grid>
          </Grid>
    
          {/* QR Code Section */}
          <Box 
            sx={{
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '24px'
            }}
          >
            <QRCode value={generatedQrCode} size={180} />
          </Box>
    
          {/* Done Button */}
          <Box mt={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleDone}
              size="large"
              fullWidth
              sx={{
                padding: '10px 0',
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 'bold',
              }}
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

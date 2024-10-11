import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container, Typography, Box, Button, Grid, Paper, LinearProgress, Alert } from '@mui/material';
import { CheckCircleOutline, ErrorOutline, Cancel } from '@mui/icons-material';
import axios from 'axios';

const CallbackResponsePage = () => {
  const { callbackType } = useParams();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionDetails, setTransactionDetails] = useState({ amount: '', refno: '' });
  const [transactionProcessed, setTransactionProcessed] = useState(false);
  const [loading, setLoading] = useState(true);  // New state to manage loading state

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nonce = params.get('nonce');
    const refno = params.get('refno');
    const amountInCents = params.get('amount');
    const signature = params.get('signature');
    const invoice_number = params.get('invoice_number');
    const error = params.get('error');

    if (callbackType === 'error-callback' && error) {
      setErrorMessage(error);
      setLoading(false);
    } else if (nonce && refno && amountInCents && signature && invoice_number) {
      const amount = (parseFloat(amountInCents) / 100).toFixed(2);

      // Set loading state to true while fetching
      setLoading(true);

      axios
        .post(`${import.meta.env.VITE_BACKEND_URL}/api/qr-codes/callback/${callbackType}`, {
          nonce,
          refno,
          amount,
          signature,
          invoice_number,
        })
        .then((response) => {
          if (response.data.message === 'Transaction already processed') {
            setTransactionProcessed(true);
            setLoading(false); // Stop loading when transaction is processed
          } else {
            setTransactionDetails({ amount, refno });
            setLoading(false); // Stop loading when data is loaded
          }
        })
        .catch((error) => {
          console.error('Error saving transaction:', error.response ? error.response.data : error.message);
          setLoading(false); // Stop loading if there’s an error
        });
    }
  }, [callbackType, location]);

  const renderContent = () => {
    if (transactionProcessed) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <CheckCircleOutline color="success" sx={{ fontSize: 70 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 2 }}>
            Transaction Already Processed
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            This payment has already been processed successfully. No further action is required.
          </Typography>
        </Box>
      );
    }

    if (loading) {
      return (
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Alert severity="info">
            Please wait, we are fetching your transaction details...
          </Alert>
          <LinearProgress sx={{ mt: 2 }} />
        </Box>
      );
    }

    switch (callbackType) {
      case 'success-callback':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircleOutline color="success" sx={{ fontSize: 70 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 2 }}>
              Payment Successful!
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Thank you for your payment. Your transaction was completed successfully.
            </Typography>
            <Paper sx={{ p: 3, mt: 4, borderRadius: 3, backgroundColor: '#f9f9f9', boxShadow: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Amount</Typography>
                  <Typography variant="h6" sx={{ color: 'green' }}>
                    ₱{transactionDetails.amount}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Reference Number</Typography>
                  <Typography variant="h6">{transactionDetails.refno}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        );
      case 'error-callback':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <ErrorOutline color="error" sx={{ fontSize: 70 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 2 }}>
              Payment Error
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {errorMessage ? errorMessage : 'There was an error processing your payment.'}
            </Typography>
          </Box>
        );
      case 'cancel-callback':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Cancel color="warning" sx={{ fontSize: 70 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 2 }}>
              Payment Cancelled
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              You have cancelled the payment. Please try again if you wish to proceed.
            </Typography>
          </Box>
        );
      default:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 2 }}>
              Unknown Status
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Container sx={{ maxWidth: 800, mt: 5, mb: 5 }}>
      <Box sx={{ textAlign: 'center' }}>
        {renderContent()}
        <Button variant="contained" color="primary" sx={{ mt: 4 }} href="/">
          Go Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default CallbackResponsePage;

import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container, Typography, Box, Button } from '@mui/material';
import axios from 'axios';

const CallbackResponsePage = () => {
  const { callbackType } = useParams();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionDetails, setTransactionDetails] = useState({ amount: '', refno: '' });

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
    } else if (nonce && refno && amountInCents && signature && invoice_number) {
      const amount = (parseFloat(amountInCents) / 100).toFixed(2);

      axios
        .post(`${import.meta.env.VITE_BACKEND_URL}/api/qr-codes/callback/${callbackType}`, {
          nonce,
          refno,
          amount,
          signature,
          invoice_number,
        })
        .then((response) => {
          setTransactionDetails({ amount, refno });
        })
        .catch((error) => {
          console.error('Error saving transaction:', error.response ? error.response.data : error.message);
        });
    }
  }, [callbackType, location]);

  const renderContent = () => {
    switch (callbackType) {
      case 'success-callback':
        return (
          <>
            <Typography variant="h4" gutterBottom>
              Payment Successful!
            </Typography>
            <Typography variant="body1">Thank you for your payment.</Typography>
            <Typography variant="body1">Amount: ₱{transactionDetails.amount}</Typography>
            <Typography variant="body1">Reference Number: {transactionDetails.refno}</Typography>
          </>
        );
      case 'error-callback':
        return (
          <>
            <Typography variant="h4" gutterBottom>
              Payment Error
            </Typography>
            <Typography variant="body1">
              {errorMessage ? errorMessage : 'There was an error processing your payment.'}
            </Typography>
          </>
        );
      case 'cancel-callback':
        return (
          <>
            <Typography variant="h4" gutterBottom>
              Payment Cancelled
            </Typography>
            <Typography variant="body1">
              You have cancelled the payment. Please try again if you wish to proceed.
            </Typography>
          </>
        );
      default:
        return (
          <Typography variant="h4" gutterBottom>
            Unknown Status
          </Typography>
        );
    }
  };

  return (
    <Container>
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        {renderContent()}
        <Button variant="contained" color="primary" sx={{ mt: 2 }} href="/">
          Go Back
        </Button>
      </Box>
    </Container>
  );
};

export default CallbackResponsePage;

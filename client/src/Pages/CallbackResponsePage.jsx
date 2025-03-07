import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container, Typography, Box, Button, Grid, Paper, LinearProgress, Alert } from '@mui/material';
import { ErrorOutline, Cancel } from '@mui/icons-material';
import axios from 'axios';

const CallbackResponsePage = () => {
  const { callbackType } = useParams();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionDetails, setTransactionDetails] = useState({ amount: '', refno: '' });
  const [transactionProcessed, setTransactionProcessed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [merchantUrl, setMerchantUrl] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nonce = params.get('nonce');
    const refno = params.get('refno');
    const amountInCents = params.get('amount');
    const signature = params.get('signature');
    const invoice_number = params.get('invoice_number');
    const error = params.get('error');
    const merchant_url = params.get('merchant_url');
    const id = params.get('id');
    const timestamp = params.get('timestamp');

    if (merchant_url) {
      setMerchantUrl(merchant_url);
    }

    if (callbackType === 'error-callback' && error) {
      setErrorMessage(error);
      setLoading(false);
    } else if (nonce && refno && amountInCents && signature && invoice_number && id) {
      const amount = (parseFloat(amountInCents) / 100).toFixed(2);

      setLoading(true);

      axios
        .post(`${import.meta.env.VITE_BACKEND_URL}/api/qr-codes/callback/${callbackType}`, {
          nonce,
          refno,
          amount,
          signature,
          invoice_number,
          id,
          timestamp,
        })
        .then((response) => {
          if (response.data.message === 'Transaction already processed') {
            setTransactionProcessed(true);
            setLoading(false);
          } else {
            setTransactionDetails({ amount, refno });
            setLoading(false);
          }
        })
        .catch((error) => {
          console.error('Error saving transaction:', error.response ? error.response.data : error.message);
          setLoading(false);
        });
    }
  }, [callbackType, location]);

  const renderContent = () => {
    if (transactionProcessed) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 2, color: '#ed1f79' }}>
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
          <LinearProgress sx={{ mt: 2, background: 'linear-gradient(#fbb03a, #ed1f79)' }} />
        </Box>
      );
    }

    switch (callbackType) {
      case 'error-callback':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <ErrorOutline sx={{ fontSize: 70, color: '#ed1f79' }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 2, color: '#ed1f79' }}>
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
            <Cancel sx={{ fontSize: 70, color: '#ed1f79' }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 2, color: '#ed1f79' }}>
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
            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 2, color: '#ed1f79' }}>
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
        <Button
          variant="contained"
          sx={{
            mt: 4,
            backgroundColor: '#ed1f79',
            color: '#fff',
            fontWeight: 'bold',
            borderRadius: '25px',
            textTransform: 'none',
            fontSize: '16px',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
            padding: '10px 20px',
            '&:hover': {
              backgroundColor: '#d91c6e',
            },
            '&:disabled': {
              backgroundColor: '#f8c4da',
              color: '#fff',
            },
          }}
          onClick={() => window.location.href = merchantUrl}
          disabled={!merchantUrl}
        >
          Return to Merchant
        </Button>
      </Box>
    </Container>
  );
};

export default CallbackResponsePage;

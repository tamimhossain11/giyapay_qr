import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Snackbar, Paper, Alert } from '@mui/material';
import axios from 'axios';
import CustomTextField from '../Mui/CustomTextField';

const EditBranch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [branchName, setBranchName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/branches/${id}`);
        const branch = response.data;
        setBranchName(branch.branch_name);
        setBankName(branch.bank_name);
        setBankBranch(branch.bank_branch);
      } catch (error) {
        console.error('Failed to fetch branch details:', error);
      }
    };

    fetchBranch();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/branches/edit/${id}`, {
        branch_name: branchName,
        bank_name: bankName,
        bank_branch: bankBranch,
      });
      showSnackbarWithMessage('Branch updated successfully', 'success');
      setTimeout(() => {
        navigate('/super-dashboard/manage-branches');
      }, 1500);

    } catch (error) {
      console.error('Failed to update branch:', error);
    }
  };

  const handleCancel = () => {
    navigate('/super-dashboard/manage-branches');
  };

  const showSnackbarWithMessage = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };
  return (
    <Box p={3} display="flex" justifyContent="center">
      <Paper elevation={3} sx={{ width: '100%', maxWidth: '600px', p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Edit Branch
        </Typography>
        <form onSubmit={handleSubmit}>
          <CustomTextField
            label="Branch Name"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <CustomTextField
            label="Bank Name"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <CustomTextField
            label="Bank Branch"
            value={bankBranch}
            onChange={(e) => setBankBranch(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <Box
            mt={2}
            display="flex"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={2}
            sx={{
              '@media (max-width: 512px)': {
                flexDirection: 'column',
                justifyContent: 'center',
              },
            }}
          >
            <Button
              type="submit"
              variant="contained"
              sx={{
                maxWidth: '150px',
                flex: 1,
                backgroundColor: '#ED1F79',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#FBB03A',
                },
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 400,
                minWidth: '120px',
                '@media (max-width: 512px)': {
                  maxWidth: '100%',
                },
              }}
              color="primary"
            >
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outlined"
              sx={{
                maxWidth: '150px',
                flex: 1,
                backgroundColor: '#FBB03A',
                color: 'black',
                '&:hover': {
                  backgroundColor: '#ED1F79',
                },
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 400,
                minWidth: '120px',
                '@media (max-width: 512px)': {
                  maxWidth: '100%',
                },
              }}
              color="secondary"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Box>

        </form>
      </Paper>
      {/* Snackbar component */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditBranch;

import React, { useState, useEffect } from 'react';
import { Button, TextField, Box, Typography, Autocomplete, Grid, Snackbar, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import CustomTextField from '../Mui/CustomTextField';

const CreateBranch = () => {
  const { id } = useParams();
  const [branchName, setBranchName] = useState('');
  const [isBranchNameUnique, setIsBranchNameUnique] = useState(true); 
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [branchUser, setBranchUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [adminId, setAdminId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch admin profile
    const fetchAdminProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const { id } = response.data;
        setAdminId(id);
      } catch (error) {
        console.error('Failed to fetch admin details:', error);
      }
    };

    fetchAdminProfile();
  }, []);

  useEffect(() => {
    // Fetch users for branch assignment
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  const checkBranchName = async (name) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/branches/check-name/${name}`);
      setIsBranchNameUnique(!response.data.exists);
    } catch (error) {
      console.error('Error checking branch name:', error);
    }
  };


  const handleBranchNameChange = (e) => {
    const name = e.target.value;
    setBranchName(name);
    if (name) {
      checkBranchName(name);
    }
  };

  const handleSave = async () => {
    if (!branchName) {
      return showSnackbarWithMessage('Please provide a Branch Name.', 'error');
    }

    if (!isBranchNameUnique) {
      return showSnackbarWithMessage('Branch name already exists.', 'error');
    }

    if (!bankName) {
      return showSnackbarWithMessage('Please provide a Bank Name.', 'error');
    }

    if (!bankBranch) {
      return showSnackbarWithMessage('Please provide a Bank Branch Name.', 'error');
    }

    if (branchUser && branchUser.id !== 'addLater') {
      try {
        const checkResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users/check-user-type`, {
          userId: branchUser.id,
        });

        const { isCoAdmin, alreadyAssigned } = checkResponse.data;

        if (isCoAdmin) {
          return showSnackbarWithMessage('The selected user is a Co-Admin and cannot be assigned to a branch.', 'error');
        }

        if (alreadyAssigned) {
          return showSnackbarWithMessage('This user is already assigned to another branch.', 'error');
        }
      } catch (error) {
        console.error('Failed to check user type or assignment:', error);
        return showSnackbarWithMessage('An error occurred while checking user details.', 'error');
      }
    }

    try {
      const branchData = {
        branchName,
        bankName,
        bankBranch,
        branchUserId: branchUser && branchUser.id !== 'addLater' ? branchUser.id : null,
        adminId, 
      };

      if (id) {
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/branches/${id}`, branchData);
        showSnackbarWithMessage('Branch updated successfully!', 'success');
      } else {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/branches`, branchData);
        showSnackbarWithMessage('Branch created successfully!', 'success');
      }

      setTimeout(() => {
        navigate('/super-dashboard/manage-branches');
      }, 1500);
    } catch (error) {
      console.error('Failed to save branch:', error);
      showSnackbarWithMessage('An error occurred while saving the branch.', 'error');
    }
  };

  const showSnackbarWithMessage = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowSnackbar(true);
  };

  const handleCancel = () => {
    navigate('/super-dashboard/manage-branches');
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
      <Box width="100%" maxWidth="600px" p={3} boxShadow={3} borderRadius={2}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
          {id ? 'Edit Branch' : 'Create Branch'}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CustomTextField
              label="Branch Name"
              value={branchName}
              onChange={handleBranchNameChange}
              fullWidth
              margin="normal"
              required
              error={!isBranchNameUnique}
              helperText={!isBranchNameUnique ? 'Branch name already exists' : ''}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              label="Bank Name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              label="Bank Branch"
              value={bankBranch}
              onChange={(e) => setBankBranch(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              options={[...users, { first_name: '', last_name: '', username: 'Add later', id: 'addLater' }]}
              getOptionLabel={(user) =>
                user.id === 'addLater' ? 'Add later' : `${user.first_name} ${user.last_name} (${user.username})`
              }
              value={branchUser}
              onChange={(event, newValue) => setBranchUser(newValue)}
              renderInput={(params) => (
                <CustomTextField
                  {...params}
                  label="Branch User (optional)"
                  fullWidth
                  margin="normal"
                  helperText="You can assign a user later on the Manage Users page"
                />
              )}
            />
          </Grid>
        </Grid>

        <Box
          mt={3}
          display="flex"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}
          sx={{
            '@media (max-width: 440px)': {
              flexDirection: 'column',
              justifyContent: 'center',  
            },
          }}
        >

          <Button
            variant="contained"
            color="secondary"
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
              // Full width on smaller screens
              '@media (max-width: 440px)': {
                maxWidth: '100%',
              },
            }}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
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
              '@media (max-width: 440px)': {
                maxWidth: '100%',
              },
            }}
            onClick={handleSave}
          >
            {id ? 'Update' : 'Save'}
          </Button>
        </Box>

      </Box>

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

export default CreateBranch;

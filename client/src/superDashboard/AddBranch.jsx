import React, { useState, useEffect } from 'react';
import { Button, TextField, Box, Typography, Autocomplete } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const CreateBranch = () => {
  const { id } = useParams();
  const [branchName, setBranchName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [branchUser, setBranchUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/all`);
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);
  
  const handleSave = async () => {
    if (!branchName) {
      return setErrorMessage('Please provide a Branch Name.');
    }
  
    if (branchUser && branchUser.id !== 'addLater') {
      try {
        // Check the user type and branch assignment
        const checkResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users/check-user-type`, {
          userId: branchUser.id,
        });
  
        const { isCoAdmin, alreadyAssigned } = checkResponse.data;
  
        if (isCoAdmin) {
          setErrorMessage('Sorry, the selected user is a Co-Admin and cannot be assigned to a branch.');
          return;
        }
  
        if (alreadyAssigned) {
          setErrorMessage('This user is already assigned to another branch.');
          return;
        }
      } catch (error) {
        console.error('Failed to check user type or assignment:', error);
        setErrorMessage('An error occurred while checking user details.');
        return;
      }
    }
  
    try {
      const branchData = {
        branchName,
        bankName,
        bankBranch,
        branchUserId: branchUser && branchUser.id !== 'addLater' ? branchUser.id : null, 
      };
  
      if (id) {
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/branches/${id}`, branchData);
      } else {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/branches`, branchData);
      }
  
      navigate('/super-dashboard/manage-branches');
    } catch (error) {
      console.error('Failed to save branch:', error);
      setErrorMessage('An error occurred while saving the branch.');
    }
  };
  

  const handleCancel = () => {
    navigate('/super-dashboard/manage-branches'); 
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {id ? 'Edit Branch' : 'Create Branch'}
      </Typography>

      {errorMessage && (
        <Typography color="error" gutterBottom>
          {errorMessage}
        </Typography>
      )}

      <TextField
        label="Branch Name"
        value={branchName}
        onChange={(e) => setBranchName(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Bank Name"
        value={bankName}
        onChange={(e) => setBankName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Bank Branch"
        value={bankBranch}
        onChange={(e) => setBankBranch(e.target.value)}
        fullWidth
        margin="normal"
      />

      <Autocomplete
        options={[...users, { first_name: '', last_name: '', username: 'Add later', id: 'addLater' }]}
        getOptionLabel={(user) =>
          user.id === 'addLater' ? 'Add later' : `${user.first_name} ${user.last_name} (${user.username})`
        }
        value={branchUser}
        onChange={(event, newValue) => setBranchUser(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Branch User (optional)"
            fullWidth
            margin="normal"
            helperText="You can assign a user later on the Manage Users page"
          />
        )}
      />

      <Box mt={2} display="flex" justifyContent="space-between">
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default CreateBranch;

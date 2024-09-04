import React, { useState, useEffect } from 'react';
import { Button, TextField, Box, Typography, Autocomplete } from '@mui/material';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

const CreateBranch = () => {
  const { id } = useParams();
  const [branchName, setBranchName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [branchUser, setBranchUser] = useState(null);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/users/all');
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleSave = async () => {
    try {
      const branchData = {
        branchName,
        bankName,
        bankBranch,
        branchUserId: branchUser ? branchUser.id : null,
      };

      if (id) {
        await axios.put(`http://localhost:3000/branches/${id}`, branchData);
      } else {
        await axios.post('http://localhost:3000/branches', branchData);
      }

      navigate('/super-dashboard/manage-branches');
    } catch (error) {
      console.error('Failed to save branch:', error);
    }
  };
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {id ? 'Edit Branch' : 'Create Branch'}
      </Typography>

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
        options={users}
        getOptionLabel={(user) => `${user.first_name} ${user.last_name} (${user.username})`}
        value={branchUser}
        onChange={(event, newValue) => setBranchUser(newValue)}
        renderInput={(params) => (
          <TextField {...params} label="Branch User" fullWidth margin="normal" />
        )}
      />

      <Button variant="contained" color="primary" onClick={handleSave} fullWidth>
        Save
      </Button>
    </Box>
  );
};

export default CreateBranch;

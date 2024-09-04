import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography } from '@mui/material';
import axios from 'axios';

const EditBranch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [branchName, setBranchName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');

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
      navigate('/super-dashboard/manage-branches'); // Navigate after successful edit
    } catch (error) {
      console.error('Failed to update branch:', error);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Edit Branch
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Branch Name"
          value={branchName}
          onChange={(e) => setBranchName(e.target.value)}
          fullWidth
          margin="normal"
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
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Save Changes
        </Button>
      </form>
    </Box>
  );
};

export default EditBranch;

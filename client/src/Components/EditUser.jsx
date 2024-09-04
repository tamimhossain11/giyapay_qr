import React, { useState, useEffect } from 'react';
import { Button, TextField, MenuItem, Typography, Autocomplete } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditUser = () => {
  const { id } = useParams(); // Get user ID from URL parameters
  const navigate = useNavigate(); // For navigation after update
  const [user, setUser] = useState({}); // State to hold user data
  const [branches, setBranches] = useState([]); // State to hold list of branches
  const [selectedBranch, setSelectedBranch] = useState(null); // State to hold selected branch

  useEffect(() => {
    // Fetch user data by ID
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/${id}`);
        setUser(response.data); // Set user data to state
        setSelectedBranch(response.data.branch_id); // Set initial selected branch
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    // Fetch all branches
    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/branches/all`);
        setBranches(response.data); // Set branches data to state
      } catch (error) {
        console.error('Failed to fetch branches:', error);
      }
    };

    fetchUser();
    fetchBranches();
  }, [id]); // Dependencies to trigger fetchUser and fetchBranches on component mount

  // Handle user update
  const handleUpdate = async () => {
    try {
      const updatedUser = {
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        user_type: user.user_type,
        branch_id: selectedBranch,
      };

      // Log payload to ensure correct structure
      console.log('Payload being sent to the server:', updatedUser);

      // Send PUT request to update user
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/users/edit/${id}`, updatedUser);
      navigate('/super-dashboard/manage-users'); // Redirect after successful update
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Edit User</Typography>
      <TextField
        label="First Name"
        value={user.first_name || ''}
        onChange={(e) => setUser({ ...user, first_name: e.target.value })}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Last Name"
        value={user.last_name || ''}
        onChange={(e) => setUser({ ...user, last_name: e.target.value })}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Username"
        value={user.username || ''}
        onChange={(e) => setUser({ ...user, username: e.target.value })}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Email"
        value={user.email || ''}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        fullWidth
        margin="normal"
      />
      <TextField
        label="User Type"
        value={user.user_type || ''}
        onChange={(e) => setUser({ ...user, user_type: e.target.value })}
        fullWidth
        margin="normal"
        select
      >
        <MenuItem value="Co-Admin">Co-Admin</MenuItem>
        <MenuItem value="Branch User">Branch User</MenuItem>
      </TextField>
      <Autocomplete
        options={branches}
        getOptionLabel={(option) => option.branch_name || option.name}
        value={branches.find(branch => branch.id === selectedBranch) || null}
        onChange={(event, newValue) => setSelectedBranch(newValue ? newValue.id : null)}
        renderInput={(params) => <TextField {...params} label="Assign Branch" margin="normal" fullWidth />}
      />
      <Button variant="contained" color="primary" onClick={handleUpdate}>Update User</Button>
    </div>
  );
};

export default EditUser;

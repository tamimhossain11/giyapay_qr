import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, FormControl, Select, InputLabel, Box, Typography, Autocomplete } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddUser = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branchUser, setBranchUser] = useState(null);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/branches/all`);
        setBranches(response.data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();
  }, []);

  const handleSave = async () => {
    try {
      const userData = {
        firstName,
        lastName,
        username,
        email,
        password,
        userType,
        branchId: branchUser ? branchUser.id : null,
      };

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users/add`, userData);
      navigate('/super-dashboard/manage-users');
    } catch (error) {
      console.error('Failed to save the user:', error);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Add User
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel id="user-type-label">User Type</InputLabel>
        <Select
          labelId="user-type-label"
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          required
        >
          <MenuItem value="Co-Admin">Co-Admin</MenuItem>
          <MenuItem value="Branch User">Branch User</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="First Name"
        fullWidth
        margin="normal"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />
      <TextField
        label="Last Name"
        fullWidth
        margin="normal"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
      />
      <TextField
        label="Username"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <TextField
        label="Email"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {userType === 'Branch User' && (
        <Autocomplete
          options={branches}
          getOptionLabel={(branch) => branch.branch_name}
          value={branchUser}
          onChange={(e, newValue) => setBranchUser(newValue)}
          renderInput={(params) => <TextField {...params} label="Select Branch" />}
          fullWidth
          margin="normal"
        />
      )}

      <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 3 }}>
        Save
      </Button>
    </Box>
  );
};

export default AddUser;

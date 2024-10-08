import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, FormControl, Select, InputLabel, Box, Typography, IconButton, InputAdornment, Autocomplete, Grid, Paper } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [branchUser, setBranchUser] = useState(null);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState('');
  const [adminId, setAdminId] = useState(null);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, 
          },
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
    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/branches/all`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setBranches(response.data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();
  }, []);

  const handleSave = async () => {
    if (password !== confirmPassword) {
      setError('Passwords did not match');
      return;
    }

    try {
      const userData = {
        firstName,
        lastName,
        username,
        email,
        password,
        userType,
        branchId: branchUser ? branchUser.id : null,
        adminId,
      };

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users/add`, userData);
      navigate('/super-dashboard/manage-users');
    } catch (error) {
      console.error('Failed to save the user:', error);
    }
  };

  const handleCancel = () => {
    navigate('/super-dashboard/manage-users');
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper elevation={3} sx={{ p: 4, maxWidth: '600px', width: '100%' }}>
        <Typography variant="h4" align="center" gutterBottom>Add User</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
          <FormControl fullWidth margin="normal">
        <Autocomplete
          options={['Co-Admin', 'Branch User']}
          renderInput={(params) => (
            <TextField {...params} label="User Type" required />
          )}
          value={userType}
          onChange={(e, newValue) => setUserType(newValue)}
        />
      </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              fullWidth
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              fullWidth
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Username"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {userType === 'Branch User' && (
            <Grid item xs={12}>
              <Autocomplete
                options={branches}
                getOptionLabel={(branch) => branch.branch_name}
                value={branchUser}
                onChange={(e, newValue) => setBranchUser(newValue)}
                renderInput={(params) => <TextField {...params} label="Select Branch (Optional)" />}
                fullWidth
              />
            </Grid>
          )}

          {error && (
            <Grid item xs={12}>
              <Typography color="error" align="center">{error}</Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between">
              <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
              <Button variant="outlined" color="secondary" onClick={handleCancel}>Cancel</Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AddUser;

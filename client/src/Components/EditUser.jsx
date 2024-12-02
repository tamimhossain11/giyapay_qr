import React, { useState, useEffect } from 'react';
import { Button, TextField, MenuItem, Box, Typography, Autocomplete, IconButton, InputAdornment, Snackbar, Alert } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MuiAlert from '@mui/material/Alert';
import CustomTextField from '../Mui/CustomTextField';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isFormValid, setIsFormValid] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/${id}`);
        setUser(response.data);
        setSelectedBranch(response.data.branch_id);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/branches/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBranches(response.data);
      } catch (error) {
        console.error('Failed to fetch branches:', error);
      }
    };

    fetchUser();
    fetchBranches();
  }, [id]);

  // Enhanced validation for required fields
  const validateForm = () => {
    if (!user.first_name.trim()) {
      setSnackbarMessage('First Name is required.');
      setOpenSnackbar(true);
      return false;
    }
    if (!user.last_name.trim()) {
      setSnackbarMessage('Last Name is required.');
      setOpenSnackbar(true);
      return false;
    }
    if (!user.username.trim()) {
      setSnackbarMessage('Username is required.');
      setOpenSnackbar(true);
      return false;
    }
    if (!user.email.trim()) {
      setSnackbarMessage('Email is required.');
      setOpenSnackbar(true);
      return false;
    }

    if (usernameError) {
      setSnackbarMessage('Username is already in use.');
      setOpenSnackbar(true);
      return false;
    }

    if (emailError) {
      setSnackbarMessage('Email is already in use.');
      setOpenSnackbar(true);
      return false;
    }

    return true;
  };


  // Check if the username already exists (excluding current user's username)
  const checkUsernameAvailability = async (username) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/check-username/${username}/${id}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking username:', error);
    }
  };

  // Check if the email already exists (excluding current user's email)
  const checkEmailAvailability = async (email) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/check-email/${email}/${id}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking email:', error);
    }
  };


  // Handle dynamic email validation
  const handleEmailChange = async (e) => {
    const email = e.target.value;
    setUser({ ...user, email });
    setEmailError(''); // Clear error

    if (email.trim() === '') {
      setEmailError('Email is required');
      return;
    }

    const isEmailTaken = await checkEmailAvailability(email);
    if (isEmailTaken) {
      setEmailError('Email is already taken.');
    }
  };



  // Handle dynamic username validation
  const handleUsernameChange = async (e) => {
    const username = e.target.value;
    setUser({ ...user, username });
    setUsernameError(''); // Clear error

    if (username.trim() === '') {
      setUsernameError('Username is required');
      return;
    }

    const isUsernameTaken = await checkUsernameAvailability(username);
    if (isUsernameTaken) {
      setUsernameError('Username is already taken.');
    }

  };

  const handleUpdate = async () => {
    setError(''); // Clear any previous error messages
    setIsError(false); // Reset error state

    // Use validateForm to check all fields
    if (!validateForm()) {
      setIsError(true); // Validation failed, it's an error
      return; // Stop if validation fails
    }

    try {
      const updatedUser = {
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        user_type: user.user_type,
        branch_id: user.user_type === 'Branch User' ? selectedBranch : null,
        status: user.status,
      };

      if (newPassword && newPassword.trim()) {
        updatedUser.password = newPassword;
      }

      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/users/edit/${id}`, updatedUser);

      setUpdateSuccess(true);
      setSnackbarMessage('User updated successfully');
      setIsError(false); // No error
      setOpenSnackbar(true);

      // Navigate back after showing the Snackbar for 2 seconds
      setTimeout(() => {
        navigate('/super-dashboard/manage-users');
      }, 2000);
    } catch (error) {
      console.error('Failed to update user:', error);
      setError(error.response?.data?.error || 'An error occurred while updating the user.');
      setSnackbarMessage('Error updating user.');
      setIsError(true); // Set error state
      setOpenSnackbar(true);
    }
  };



  const handleCancel = () => {
    navigate('/super-dashboard/manage-users');
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', minHeight: '80vh' }}>
      <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>Edit User</Typography>
      <CustomTextField
        label="First Name"
        value={user.first_name || ''}
        onChange={(e) => setUser({ ...user, first_name: e.target.value })}
        fullWidth
        margin="normal"
        error={!user.first_name}
        helperText={!user.first_name && 'First name is required'}
      />
      <CustomTextField
        label="Last Name"
        value={user.last_name || ''}
        onChange={(e) => setUser({ ...user, last_name: e.target.value })}
        fullWidth
        margin="normal"
        error={!user.last_name}
        helperText={!user.last_name && 'Last name is required'}
      />
      <CustomTextField
        label="Username"
        value={user.username || ''}
        onChange={handleUsernameChange} // Dynamic check
        fullWidth
        margin="normal"
        required
        error={!!usernameError}
        helperText={usernameError || 'Username is required'}
      />

      <CustomTextField
        label="Email"
        value={user.email || ''}
        onChange={handleEmailChange} // Dynamic check
        fullWidth
        margin="normal"
        required
        error={!!emailError}
        helperText={emailError || 'Email is required'}
      />
      <CustomTextField
        label="User Type"
        value={user.user_type || ''}
        onChange={(e) => setUser({ ...user, user_type: e.target.value })}
        fullWidth
        margin="normal"
        select
      >
        <MenuItem value="Co-Admin">Co-Admin</MenuItem>
        <MenuItem value="Branch User">Branch User</MenuItem>
      </CustomTextField>

      {user.user_type === 'Branch User' && (
        <Autocomplete
          options={branches}
          getOptionLabel={(option) => option.branch_name}
          value={branches.find((branch) => branch.id === selectedBranch) || null}
          onChange={(event, newValue) => setSelectedBranch(newValue ? newValue.id : null)}
          renderInput={(params) => <CustomTextField {...params} label="Assign Branch" margin="normal" fullWidth />}
        />
      )}

      <Box mt={2}>
        <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
          {showPasswordField ? 'Change your password' : 'Do you want to update the password?'}
          <Button onClick={() => setShowPasswordField(!showPasswordField)} sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>Click here</Button>
        </Typography>
        {showPasswordField && (
          <CustomTextField
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
      </Box>

      {error && <Typography color="error">{error}</Typography>}

      <Box
        mt={2}
        display="flex"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
        sx={{
          // For small screens (below 440px), stack the buttons vertically and make them full width
          '@media (max-width: 440px)': {
            flexDirection: 'column',
            justifyContent: 'center', // Center the buttons when stacked
          },
        }}
      >
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleCancel}
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
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdate}
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
            // Full width on smaller screens
            '@media (max-width: 440px)': {
              maxWidth: '100%',
            },
          }}
        >
          Update User
        </Button>
      </Box>


      {/* Snackbar for success/error message */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={isError ? 'error' : 'success'}>
          {snackbarMessage}
        </Alert>
      </Snackbar>


    </div>
  );
};

export default EditUser;

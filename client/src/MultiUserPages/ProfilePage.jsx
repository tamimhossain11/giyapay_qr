import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Avatar, 
  CircularProgress, 
  Box, 
  Paper 
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import BranchIcon from '@mui/icons-material/Business';
import StatusIcon from '@mui/icons-material/ToggleOn';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LockIcon from '@mui/icons-material/Lock';  // Icon for secret

const ProfilePage = () => {
  const [profile, setProfile] = useState(null); 
  const [error, setError] = useState(''); 

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, 
          },
        });

        setProfile(response.data); 
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Error fetching profile data.');
      }
    };

    fetchProfile(); 
  }, []);

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <ErrorOutlineIcon color="error" />
        <Typography color="error" variant="h6" marginLeft={1}>
          {error}
        </Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
        <Typography variant="h6" marginLeft={2}>
          Loading profile...
        </Typography>
      </Box>
    );
  }

  const renderProfileDetail = (icon, label, value) => (
    <Grid item xs={12} sm={6} display="flex" alignItems="center">
      {icon}
      <Typography variant="body1" sx={{ marginLeft: 1 }}>
        <strong>{label}:</strong> {value || 'N/A'}
      </Typography>
    </Grid>
  );

  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="80vh" 
    >
      <Paper elevation={6} sx={{ maxWidth: 800, width: '100%', padding: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="center" marginBottom={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 80, height: 80 }}>
            <AccountCircleIcon sx={{ fontSize: 50 }} />
          </Avatar>
        </Box>
        <Typography variant="h4" align="center" gutterBottom>
          {profile.user_type === 'admin' ? 'Admin Profile' : 'User Profile'}
        </Typography>
        <Grid container spacing={2}>
          {renderProfileDetail(<BadgeIcon />, 'ID', profile.id)}
          {profile.user_type === 'admin' ? (
            <>
              {renderProfileDetail(<EmailIcon />, 'Email', profile.email)}
              {renderProfileDetail(<PersonIcon />, 'Merchant Name', profile.merchant_name)} {/* Display Merchant Name */}
              {renderProfileDetail(<LockIcon />, 'Merchant Secret', profile.merchant_secret)} {/* Display Merchant Secret */}
            </>
          ) : (
            <>
              {renderProfileDetail(<PersonIcon />, 'First Name', profile.first_name)}
              {renderProfileDetail(<PersonIcon />, 'Last Name', profile.last_name)}
              {renderProfileDetail(<BadgeIcon />, 'Username', profile.username)}
              {renderProfileDetail(<EmailIcon />, 'Email', profile.email)}
              {renderProfileDetail(<StatusIcon />, 'Status', profile.status)}
              {profile.branch && renderProfileDetail(<BranchIcon />, 'Branch Name', profile.branch.branch_name)}
              {renderProfileDetail(<PersonIcon />, 'Merchant Name', profile.merchant_name)} {/* Display Merchant Name */}
              {renderProfileDetail(<LockIcon />, 'Merchant Secret', profile.merchant_secret)} {/* Display Merchant Secret */}
              
            </>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProfilePage;

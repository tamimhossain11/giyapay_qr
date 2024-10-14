import React from 'react';
import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 400,
    borderRadius: '10px',
    '& fieldset': {
      borderColor: '#e0e0e0', // Default border color
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: '#000', // Border color on hover
    },
    '&.Mui-focused fieldset': {
      borderColor: '#000', // Border color when focused
    },
  },
  '& .MuiInputLabel-root': {
    color: '#616161', // Default label color
    fontFamily: 'Montserrat, sans-serif',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#616161', // Label color when focused
  },
}));

const CustomTextField = ({ label, ...props }) => {
  return (
    <StyledTextField
      label={label}
      variant="outlined"
      fullWidth
      {...props}
    />
  );
};

export default CustomTextField;

// CustomTextField.jsx
import React from 'react';
import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 400,
    borderRadius: '10px', // Border radius
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
    color: '#616161', // Label color
    fontFamily: 'Montserrat, sans-serif',
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

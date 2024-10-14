// CustomAutocomplete.jsx
import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
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
    color: '#616161', // Label color
    fontFamily: 'Montserrat, sans-serif',
  },
}));

const CustomAutocomplete = ({ options, value, onChange, label, helperText }) => {
  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) =>
        option.id === 'addLater' ? 'Add later' : `${option.first_name} ${option.last_name} (${option.username})`
      }
      value={value}
      onChange={onChange}
      renderInput={(params) => (
        <StyledTextField
          {...params}
          label={label}
          fullWidth
          margin="normal"
          helperText={helperText}
        />
      )}
    />
  );
};

export default CustomAutocomplete;

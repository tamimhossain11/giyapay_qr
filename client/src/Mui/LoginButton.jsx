import React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, rgba(221,142,10,1) 4%, rgba(255,0,110,0.965) 100%)',
  color: '#ffffff',
  fontWeight: 'bold',
  padding: '16px 0', // Increased padding for taller button
  borderRadius: '8px',
  width: '100%', // Make the button as wide as the input adornments
  transition: 'background 0.3s',
  '&:hover': {
    background: 'linear-gradient(90deg, rgba(221,142,10,1) 20%, rgba(255,0,110,0.965) 100%)',
  },
}));

export default function LoginButton({ onClick, children }) {
  return (
    <GradientButton
      variant="contained"
      onClick={onClick}
    >
      {children}
    </GradientButton>
  );
}

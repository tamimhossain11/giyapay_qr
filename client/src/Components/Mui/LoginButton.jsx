import React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';


const GradientButton = styled(Button)(({ theme }) => ({
  color: '#fff',
  backgroundImage: 'linear-gradient(to right, #FBB03A, #ED1F79, #FBB03A, #ED1F79)',
  backgroundSize: '300% 100%',
  border: '1px',
  transition: 'all 0.4s ease-in-out',
  padding: '12px 24px',
  borderRadius: '8px',
  width: '100%',
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 400,
  textTransform: 'none',
  '&:hover': {
    backgroundPosition: '100% 0',
  },
}));


export default function LoginButton({ onClick, children, ...props }) {
  return (
    <GradientButton
      variant="contained"
      onClick={onClick}
      {...props}
    >
      {children}
    </GradientButton>
  );
}


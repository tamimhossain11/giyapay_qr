import React, { useState, useEffect } from 'react';
import '../css/login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import logo from '../assets/login.svg';
import InputAdornments from '../Mui/InputAdornments';
import LoginButton from '../Mui/LoginButton';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Login = () => {
    const [values, setValues] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); 
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const expirationTime = localStorage.getItem('expirationTime');
        if (token && expirationTime && Date.now() < expirationTime) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }

        const checkTokenExpiration = setInterval(() => {
            const token = localStorage.getItem('token');
            const expirationTime = localStorage.getItem('expirationTime');
            if (token && expirationTime && Date.now() >= expirationTime) {
                handleLogout();
            }
        }, 60000);

        return () => clearInterval(checkTokenExpiration);
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true); 

        try {
            const result = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, values);
            if (result.data.token) {
                const decodedToken = jwtDecode(result.data.token);
                const expirationTime = decodedToken.exp * 1000;

                localStorage.setItem("token", result.data.token);
                localStorage.setItem("userType", decodedToken.userType);
                localStorage.setItem("expirationTime", expirationTime);

                setIsLoggedIn(true);
                setSnackbarMessage('Login successful!');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);

                 // Redirect based on user type and ID
                 if (decodedToken.userType === 'admin' && decodedToken.id === 5) {
                    navigate('/merchant-management'); 
                } else if (decodedToken.userType === 'admin') {
                    navigate('/super-dashboard');
                } else if (decodedToken.userType === 'Branch User') {
                    navigate('/branch-dashboard');
                } else if (decodedToken.userType === 'Co-Admin') {
                    navigate('/co-admin-dashboard');
                }
            } else {
                setError(result.data.error || 'Login failed');
                setSnackbarMessage(result.data.error || 'Login failed');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Login failed');
            setSnackbarMessage(err.response?.data?.error || 'Login failed');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        localStorage.removeItem("expirationTime");
        setIsLoggedIn(false);
        navigate('/');
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-left">
                    <img src={logo} alt="Giyapay Logo" className="login-logo" />
                </div>
                <div className="login-right">
                    {isLoggedIn ? (
                        <div className="logout-section">
                            <h2>Welcome Back</h2>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleLogout}
                                fullWidth
                                sx={{ mt: 2 }}
                                className="logout-button"
                            >
                                LOG OUT
                            </Button>
                        </div>
                    ) : (
                        <div className="login-form">
                            <h2>Welcome to Giyapay QR</h2>
                            <p className="subtitle">Sign in to your account</p>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <InputAdornments
                                        label="Email"
                                        type="email"
                                        value={values.email}
                                        onChange={(e) => setValues({ ...values, email: e.target.value })}
                                        placeholder="Enter Email"
                                        variant="outlined"
                                    />
                                </div>
                                <div className="form-group">
                                    <InputAdornments
                                        label="Password"
                                        type="password"
                                        value={values.password}
                                        onChange={(e) => setValues({ ...values, password: e.target.value })}
                                        placeholder="Enter Password"
                                        variant="outlined"
                                    />
                                </div>
                                <div className="form-group form-check">
                                    <input type="checkbox" className="form-check-input" id="rememberMe" />
                                    <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                                </div>
                                <Box sx={{ position: 'relative', mt: 2 }}>
                                    <LoginButton
                                        type="submit"
                                        fullWidth
                                        disabled={loading}
                                        className="login-button"
                                    >
                                        {loading ? <CircularProgress size={24} color="inherit" /> : 'SIGN IN'}
                                    </LoginButton>

                                </Box>
                            </form>
                            {error && <div className="error">{error}</div>}
                        </div>
                    )}
                </div>
            </div>
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default Login;

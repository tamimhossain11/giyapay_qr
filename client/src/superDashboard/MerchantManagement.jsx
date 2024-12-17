import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    TextField, Button, Box, Typography, Container, Paper, IconButton, InputAdornment, Grid,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Collapse, Snackbar,
    Alert, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Visibility, VisibilityOff, ExpandMore, ExpandLess, Logout } from '@mui/icons-material';
import { FaUsers } from 'react-icons/fa';
import { styled } from '@mui/system';
import io from 'socket.io-client';
import CustomTextField from '../Mui/CustomTextField';


const LeftSection = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    borderRight: `1px solid ${theme.palette.divider}`,
    height: '100%',
}));

const RightSection = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    height: '100%',
}));

const WelcomeBanner = styled(Box)(({ theme }) => ({
    backgroundColor: '#ED1F79', // Giyapay brand color
    color: theme.palette.common.white,
    padding: theme.spacing(2),
    textAlign: 'center',
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(3),
}));

const ResponsiveTable = styled(TableContainer)(({ theme }) => ({
    marginTop: theme.spacing(3),
    maxHeight: '400px',
    '& table': {
        width: '100%',
        tableLayout: 'fixed',
    },
    [theme.breakpoints.up('md')]: {
        '& table': {
            tableLayout: 'auto',
        },
    },
}));

const MerchantManagement = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [merchantID, setMerchantID] = useState('');
    const [merchantName, setMerchantName] = useState('');
    const [merchantSecret, setMerchantSecret] = useState('');
    const [paymentUrl, setPaymentUrl] = useState('');
    const [merchantUrl, setMerchantUrl] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [gatewayAccount, setGatewayAccount] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [adminTotal, setAdminTotal] = useState(0);
    const [admins, setAdmins] = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [socket, setSocket] = useState(null);

    const [errors, setErrors] = useState({});

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

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

    useEffect(() => {
        const fetchAdminCountAndAdmins = async () => {
            try {
                // Fetch total admin count
                const countResult = await axios.get(`${backendUrl}/admin/count`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (countResult.data.Status) {
                    setAdminTotal(countResult.data.Result);
                }

                // Fetch admin list
                const adminsResult = await axios.get(`${backendUrl}/admin/all`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setAdmins(adminsResult.data.Result);
            } catch (error) {
                console.error('Error fetching admin data:', error);
            }
        };

        fetchAdminCountAndAdmins();
    }, []);

    useEffect(() => {
        const newSocket = io(backendUrl, {
            auth: {
                token: localStorage.getItem('token'),
            },
        });

        setSocket(newSocket);

        // Listen for real-time updates to the admin list
        newSocket.on('adminListUpdated', (updatedAdminList) => {
            setAdmins(updatedAdminList);
        });

        // Clean up the connection when the component unmounts
        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [backendUrl]);

    const validateForm = () => {
        const newErrors = {};

        if (!email) newErrors.email = 'Email is required';
        if (!password) newErrors.password = 'Password is required';
        if (!merchantName) newErrors.merchantName = 'Merchant Name is required';
        if (!merchantID) newErrors.merchantID = 'Merchant ID is required';
        if (!merchantSecret) newErrors.merchantSecret = 'Merchant Secret is required';
        if (!paymentUrl) newErrors.paymentUrl = 'Payment URL is required';
        if (!merchantUrl) newErrors.merchantUrl = 'Merchant URL is required';
        if (!gatewayAccount) newErrors.gatewayAccount = 'Gateway Account Type is required';

        // Validate Payment Method only if Gateway Account is Individual
        if (gatewayAccount === 'Individual' && !paymentMethod) {
            newErrors.paymentMethod = 'Payment Method is required for Individual accounts';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };




    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        localStorage.removeItem("expirationTime");
        setIsLoggedIn(false);
        window.location.href = '/';
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        const formData = {
            email,
            password,
            merchant_name: merchantName,
            merchant_id: merchantID,
            merchant_secret: merchantSecret,
            paymentUrl,
            merchant_url: merchantUrl,
            gateway_account_type: gatewayAccount,
            payment_method: gatewayAccount === 'Universal' ? null : paymentMethod,
        };

        try {
            const response = await axios.post(`${backendUrl}/admin/add`, formData);

            setSnackbarMessage(response.data.message);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);

            // Clear form state
            setEmail('');
            setPassword('');
            setMerchantID('');
            setMerchantSecret('');
            setPaymentUrl('');
            setMerchantUrl('');
            setGatewayAccount('');
            setPaymentMethod('');
        } catch (error) {
            console.error('Error adding admin:', error);
            setSnackbarMessage('Failed to add admin');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };



    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleRowExpansion = (rowIndex) => {
        setExpandedRow(expandedRow === rowIndex ? null : rowIndex);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 5 }}>
            {/* Welcome Message */}
            <WelcomeBanner>
                <Typography variant="h4">Welcome to the Super Admin Dashboard</Typography>
                <Typography variant="subtitle1">Manage merchants and view stats below</Typography>
            </WelcomeBanner>

            <Grid container spacing={4} sx={{ flexGrow: 1 }}>
                <Grid item xs={12} md={5}>
                    <LeftSection component={Paper} elevation={3}>
                        <Typography variant="h5" gutterBottom>
                            Add Admin
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <Box mb={2}>
                                <CustomTextField
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    fullWidth
                                    required
                                    error={!!errors.email}
                                    helperText={errors.email}
                                />
                            </Box>
                            <Box mb={2}>
                                <CustomTextField
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    fullWidth
                                    required
                                    error={!!errors.password}
                                    helperText={errors.password}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleClickShowPassword}>
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                            <Box mb={2}>
                                <CustomTextField
                                    label="Merchant Name"
                                    value={merchantName}
                                    onChange={(e) => setMerchantName(e.target.value)}
                                    fullWidth
                                    required
                                    error={!!errors.merchantName}
                                    helperText={errors.merchantName}
                                />
                            </Box>
                            <Box mb={2}>
                                <CustomTextField
                                    label="Merchant ID"
                                    value={merchantID}
                                    onChange={(e) => setMerchantID(e.target.value)}
                                    fullWidth
                                    required
                                    error={!!errors.merchantID}
                                    helperText={errors.merchantID}
                                />
                            </Box>
                            <Box mb={2}>
                                <CustomTextField
                                    label="Merchant Secret"
                                    value={merchantSecret}
                                    onChange={(e) => setMerchantSecret(e.target.value)}
                                    fullWidth
                                    required
                                    error={!!errors.merchantSecret}
                                    helperText={errors.merchantSecret}
                                />
                            </Box>
                            <Box mb={2}>
                                <CustomTextField
                                    label="checkout Url"
                                    value={paymentUrl}
                                    onChange={(e) => setPaymentUrl(e.target.value)}
                                    fullWidth
                                    required
                                    error={!!errors.paymentUrl}
                                    helperText={errors.paymentUrl}
                                />
                            </Box>
                            <Box mb={2}>
                                <CustomTextField
                                    label="Merchant Url"
                                    value={merchantUrl}
                                    onChange={(e) => setMerchantUrl(e.target.value)}
                                    fullWidth
                                    required
                                    error={!!errors.merchantUrl}
                                    helperText={errors.merchantUrl}
                                />
                            </Box>
                            <Box mb={2}>
                                <FormControl fullWidth required error={!!errors.gatewayAccount}>
                                    <InputLabel id="gateway-account-type-label">Gateway Account Type</InputLabel>
                                    <Select
                                        labelId="gateway-account-type-label"
                                        value={gatewayAccount}
                                        onChange={(e) => {
                                            setGatewayAccount(e.target.value);

                                            // Reset payment method if Gateway Account Type is Universal
                                            if (e.target.value === 'Universal') {
                                                setPaymentMethod('');
                                            }
                                        }}
                                    >
                                        <MenuItem value="Individual">Individual</MenuItem>
                                        <MenuItem value="Universal">Universal</MenuItem>
                                    </Select>
                                    {errors.gatewayAccount && <FormHelperText>{errors.gatewayAccount}</FormHelperText>}
                                </FormControl>
                            </Box>

                            {/* Conditional Payment Method Field */}
                            {gatewayAccount === 'Individual' && (
                                <Box mb={2}>
                                    <FormControl fullWidth required error={!!errors.paymentMethod}>
                                        <InputLabel id="payment-method-label">Payment Method</InputLabel>
                                        <Select
                                            labelId="payment-method-label"
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        >
                                            {/* Example Payment Methods */}
                                            <MenuItem value="MASTERCARD/VISA">MASTERCARD/VISA</MenuItem>
                                            <MenuItem value="GCASH">GCASH</MenuItem>
                                            <MenuItem value="INSTAPAY">INSTAPAY</MenuItem>
                                        </Select>
                                        {errors.paymentMethod && <FormHelperText>{errors.paymentMethod}</FormHelperText>}
                                    </FormControl>
                                </Box>
                            )}


                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                sx={{
                                    color: '#fff',
                                    backgroundImage: 'linear-gradient(to right, #FBB03A, #ED1F79, #FBB03A, #ED1F79)',
                                    backgroundSize: '300% 100%',
                                    border: 'none',
                                    transition: 'all 0.4s ease-in-out',
                                    padding: '8px 40px',
                                    borderRadius: '8px',
                                    fontFamily: 'Montserrat, sans-serif',
                                    fontWeight: 400,
                                    textTransform: 'none',
                                    '&:hover': {
                                        backgroundPosition: '100% 0',
                                    },
                                }}
                            >
                                Add Admin
                            </Button>

                        </form>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<Logout />}
                            onClick={handleLogout}
                            fullWidth
                            sx={{
                                mt: 4,
                                color: '#fff',
                                backgroundColor: '#ED1F79',
                                padding: '10px 50px',
                                borderRadius: '8px',
                                fontFamily: 'Montserrat, sans-serif',
                                fontWeight: 600,
                                textTransform: 'none',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: '#FBB03A',
                                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                                },
                            }}
                        >
                            LOG OUT
                        </Button>

                    </LeftSection>
                </Grid>

                <Grid item xs={12} md={7}>
                    <RightSection component={Paper} elevation={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" gutterBottom>
                                <FaUsers style={{ marginRight: 8 }} />
                                Super Admin Dashboard
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#ED1F79',
                                    fontFamily: 'Montserrat, sans-serif',
                                    fontWeight: 600,
                                }}
                            >
                                Total Admins: {adminTotal}
                            </Typography>

                        </Box>

                        <ResponsiveTable component={Paper}>
                            <Table stickyHeader sx={{ minWidth: 650, width: '100%', overflowX: 'auto' }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Merchant Name</TableCell>
                                        <TableCell>Merchant ID</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Payment URL</TableCell>
                                        <TableCell>Merchant URL</TableCell>
                                        <TableCell>Gateway Account Type</TableCell>
                                        <TableCell>Payment Method</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {admins.map((admin, index) => (
                                        <React.Fragment key={admin.id}>
                                            <TableRow hover>
                                                <TableCell sx={{ minWidth: 100, wordBreak: 'break-word' }}>{admin.id}</TableCell>
                                                <TableCell sx={{ minWidth: 200, wordBreak: 'break-word' }}>{admin.merchant_name}</TableCell>
                                                <TableCell sx={{ minWidth: 150, wordBreak: 'break-word' }}>{admin.merchant_id}</TableCell>
                                                <TableCell sx={{ minWidth: 250, wordBreak: 'break-word' }}>{admin.email}</TableCell>
                                                <TableCell sx={{ minWidth: 250, wordBreak: 'break-word' }}>{admin.paymentUrl}</TableCell>
                                                <TableCell sx={{ minWidth: 250, wordBreak: 'break-word' }}>{admin.merchant_url}</TableCell>
                                                <TableCell sx={{ minWidth: 250, wordBreak: 'break-word' }}>{admin.gateway_account_type}</TableCell>
                                                <TableCell sx={{ minWidth: 250, wordBreak: 'break-word' }}>{admin.payment_method} </TableCell>
                                                <TableCell>
                                                    <IconButton onClick={() => toggleRowExpansion(index)}>
                                                        {expandedRow === index ? <ExpandLess /> : <ExpandMore />}
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={5} sx={{ p: 0 }}>
                                                    <Collapse in={expandedRow === index} timeout="auto" unmountOnExit>
                                                        <Box sx={{ p: 2 }}>
                                                            <Typography variant="subtitle1" gutterBottom>
                                                                Merchant Secret: {admin.merchant_secret}
                                                            </Typography>
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </ResponsiveTable>

                    </RightSection>
                </Grid>
            </Grid>

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default MerchantManagement;

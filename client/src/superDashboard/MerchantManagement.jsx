import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    TextField, Button, Box, Typography, Container, Paper, IconButton, InputAdornment, Grid,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Collapse, Snackbar,
    Alert
} from '@mui/material';
import { Visibility, VisibilityOff, ExpandMore, ExpandLess, Logout } from '@mui/icons-material';
import { FaUsers } from 'react-icons/fa';
import { styled } from '@mui/system';
import io from 'socket.io-client';


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
    backgroundColor: theme.palette.primary.main,
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
            tableLayout: 'auto', // Wider tables on larger screens
        },
    },
}));

const MerchantManagement = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [merchantID, setMerchantID] = useState('');
    const [merchantName, setMerchantName] = useState('');
    const [merchantSecret, setMerchantSecret] = useState('');
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
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // Auth token if needed
                    },
                });
                if (countResult.data.Status) {
                    setAdminTotal(countResult.data.Result);
                }

                // Fetch admin list
                const adminsResult = await axios.get(`${backendUrl}/admin/all`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // Auth token if needed
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

        try {
            const response = await axios.post(`${backendUrl}/admin/add`, {
                email,
                password,
                merchant_name: merchantName,
                merchant_id: merchantID,
                merchant_secret: merchantSecret,
            });

            setSnackbarMessage(response.data.message);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setEmail('');
            setPassword('');
            setMerchantID('');
            setMerchantSecret('');
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
                                <TextField
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
                                <TextField
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
                                <TextField
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
                                <TextField
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
                                <TextField
                                    label="Merchant Secret"
                                    value={merchantSecret}
                                    onChange={(e) => setMerchantSecret(e.target.value)}
                                    fullWidth
                                    required
                                    error={!!errors.merchantSecret}
                                    helperText={errors.merchantSecret}
                                />
                            </Box>
                            <Button type="submit" variant="contained" color="primary" fullWidth>
                                Add Admin
                            </Button>
                        </form>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<Logout />}
                            onClick={handleLogout}
                            fullWidth
                            sx={{ mt: 4 }}
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
                            <Typography variant="h6" color="primary">
                                Total Admins: {adminTotal}
                            </Typography>
                        </Box>

                        <ResponsiveTable component={Paper}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Merchant Name</TableCell>
                                        <TableCell>Merchant ID</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {admins.map((admin, index) => (
                                        <React.Fragment key={admin.id}>
                                            <TableRow hover>
                                                <TableCell>{admin.id}</TableCell>
                                                <TableCell>{admin.merchant_name}</TableCell>
                                                <TableCell>{admin.merchant_id}</TableCell>
                                                <TableCell>{admin.email}</TableCell>
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

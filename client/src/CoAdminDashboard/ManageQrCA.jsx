import React, { useState, useEffect } from 'react';
import {
  Box, Button, Container, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, Typography, IconButton, Tooltip, TextField, MenuItem, Select, InputLabel, FormControl, CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import QRCode from 'qrcode.react';
import { io } from 'socket.io-client';
import RippleLoader from '../Components/Loader';

const ManageQrCA = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [filteredQrCodes, setFilteredQrCodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedQr, setSelectedQr] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [branchFilter, setBranchFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });
  const [userType, setUserType] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const newSocket = io(backendUrl, {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    setSocket(newSocket);

    // Clean up the connection when the component unmounts
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [backendUrl]);

  useEffect(() => {
    const fetchQrCodes = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const qrCodeResponse = await axios.get(`${backendUrl}/api/qr-codes/get_qr_bu`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const formattedQrCodes = qrCodeResponse.data.map((qr) => ({
          ...qr,
          user_name: qr.user ? qr.user.username : 'Unknown User',
          branch_name: qr.branch ? qr.branch.branch_name : 'Unknown Branch',
          created_at: qr.createdAt ? new Date(qr.createdAt).toLocaleString() : 'N/A',
          updated_at: qr.updatedAt ? new Date(qr.updatedAt).toLocaleString() : 'N/A',
        }));

        setQrCodes(formattedQrCodes);
        setFilteredQrCodes(formattedQrCodes);
      } catch (error) {
        console.error('Error fetching QR codes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQrCodes();

    // Listen for QR code updates from the server
    if (socket) {
      socket.on('qr-code-updated', (data) => {
        const newQrCode = data.qrCode;
        const formattedQrCode = {
          ...newQrCode,
          created_at: newQrCode.createdAt ? new Date(newQrCode.createdAt).toLocaleString() : 'N/A',
          updated_at: newQrCode.updatedAt ? new Date(newQrCode.updatedAt).toLocaleString() : 'N/A',
        };

        setQrCodes((prevQrCodes) => {
          const existingQr = prevQrCodes.find((qr) => qr.id === formattedQrCode.id);
          if (existingQr) {
            // If the QR code exists, update it
            return prevQrCodes.map((qr) =>
              qr.id === formattedQrCode.id ? { ...qr, ...formattedQrCode } : qr
            );
          } else {
            return prevQrCodes;
          }
        });

        setFilteredQrCodes((prevFiltered) => {
          const existingFilteredQr = prevFiltered.find((qr) => qr.id === formattedQrCode.id);
          if (existingFilteredQr) {
            return prevFiltered.map((qr) =>
              qr.id === formattedQrCode.id ? { ...qr, ...formattedQrCode } : qr
            );
          } else {
            return prevFiltered;
          }
        });
      });

      socket.on('qr-code-deleted', (deletedQrCodeId) => {
        console.log("QR Code Deleted Event Received:", deletedQrCodeId);

        setQrCodes((prevQrCodes) => prevQrCodes.filter((qr) => qr.id !== deletedQrCodeId));
        setFilteredQrCodes((prevFiltered) =>
          prevFiltered.filter((qr) => qr.id !== deletedQrCodeId)
        );
      });
    }

    // Cleanup event listeners on component unmount or socket change
    return () => {
      if (socket) {
        socket.off('qr-code-updated');
        socket.off('qr-code-deleted');
      }
    };
  }, [socket, backendUrl]);


  useEffect(() => {
    const fetchFilteredQrCodes = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/qr-codes/coadmin_filter`, {
          params: {
            searchTerm,
            branchFilter,
            userFilter,
            startDate: dateFilter.startDate,
            endDate: dateFilter.endDate,
          },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        const data = Array.isArray(response.data) ? response.data : [];

        const formattedQrCodes = data.map((qr) => ({
          ...qr,
          user_name: qr.user ? qr.user.username : 'Unknown User',
          branch_name: qr.branch ? qr.branch.branch_name : 'Unknown Branch',
          created_at: qr.createdAt ? new Date(qr.createdAt).toLocaleString() : 'N/A',
          updated_at: qr.updatedAt ? new Date(qr.updatedAt).toLocaleString() : 'N/A',
          qr_code: qr.qr_code,
        }));

        setFilteredQrCodes(formattedQrCodes);
      } catch (error) {
        console.error('Error fetching filtered QR codes:', error);
        setFilteredQrCodes([]);
      }
    };

    fetchFilteredQrCodes();
  }, [searchTerm, branchFilter, userFilter, dateFilter, backendUrl]);

  useEffect(() => {
    const fetchBranchesAndUsers = async () => {
      try {
        const [branchesResponse, usersResponse] = await Promise.all([
          axios.get(`${backendUrl}/branches/coadmin_all`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get(`${backendUrl}/users//coadmin_all`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);

        setBranches(branchesResponse.data);
        setUsers(usersResponse.data);
      } catch (error) {
        console.error('Error fetching branches and users:', error);
      }
    };

    fetchBranchesAndUsers();
  }, [backendUrl]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenView = (qr) => {
    setSelectedQr(qr);
    setOpenView(true);
  };

  const handleCloseView = () => {
    setOpenView(false);
    setSelectedQr(null);
  };

  const handleDateChange = (event) => {
    setDateFilter({
      ...dateFilter,
      [event.target.name]: event.target.value,
    });
  };


  const headers = [
    { label: 'ID', key: 'id' },
    { label: 'QR Code', key: 'qr_code' },
    { label: 'Payment Reference', key: 'payment_reference' },
    { label: 'Amount', key: 'amount' },
    { label: 'Status', key: 'status' },
    { label: 'Description', key: 'description' },
    { label: 'Created At', key: 'created_at' },
    { label: 'Updated At', key: 'updated_at' },
  ];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <RippleLoader/>
      </Box>
    );
  }

  return (
    <Container maxWidth={false} disableGutters>
      <Box mt={4} width="100%">
        <Typography variant="h4" gutterBottom>
          Manage QR Codes
        </Typography>

        <Box mb={2}>
          {/* Filter Container */}
          <Box display="flex" flexWrap="wrap" gap={2} width="100%">
            {/* First Row */}
            <Box display="flex" flexWrap="wrap" gap={2} width="100%">
              <TextField
                label="Search Payment Reference"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Start Date"
                type="date"
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
                name="startDate"
                value={dateFilter.startDate}
                onChange={handleDateChange}
                sx={{ flex: 1 }}
              />
              <TextField
                label="End Date"
                type="date"
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
                name="endDate"
                value={dateFilter.endDate}
                onChange={handleDateChange}
                sx={{ flex: 1 }}
              />
            </Box>

            {/* Second Row */}
            <Box display="flex" flexWrap="wrap" gap={2} mt={2} width="100%">
              <FormControl variant="outlined" size="small" sx={{ flex: 1 }}>
                <InputLabel>Branch Name</InputLabel>
                <Select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  label="Branch Name"
                >
                  <MenuItem value="">All Branches</MenuItem>
                  {branches.map((branch) => (
                    <MenuItem key={branch.id} value={branch.branch_name}>
                      {branch.branch_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl variant="outlined" size="small" sx={{ flex: 1 }}>
                <InputLabel>User Name</InputLabel>
                <Select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  label="User Name"
                >
                  <MenuItem value="">All Users</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.username}>
                      {user.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Buttons */}
          <Box mt={2} display="flex" gap={2}>
            <Button variant="contained" color="primary" onClick={() => setPage(0)}>
              Apply Filters
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                setSearchTerm('');
                setBranchFilter('');
                setUserFilter('');
                setDateFilter({ startDate: '', endDate: '' });
                setPage(0);
              }}
            >
              Clear Filters
            </Button>

            <CSVLink
              data={filteredQrCodes}
              headers={headers}
              filename={`QR_Codes_${new Date().toISOString().split('T')[0]}.csv`}
            >
              <Button variant="contained" color="primary" startIcon={<DownloadIcon />}>
                Export to CSV
              </Button>
            </CSVLink>
          </Box>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>QR Code</TableCell>
                <TableCell>Payment Reference</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Updated At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredQrCodes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((qr, index) => (
                <TableRow key={qr.id || `qr-${index}`}>
                  <TableCell>{qr.id}</TableCell>
                  <TableCell>
                    <QRCode value={qr.qr_code} size={50} />
                  </TableCell>
                  <TableCell>{qr.payment_reference}</TableCell>
                  <TableCell>{qr.amount}</TableCell>
                  <TableCell>{qr.status}</TableCell>
                  <TableCell style={{ whiteSpace: 'pre-wrap' }}>
                    {qr.description}
                  </TableCell>
                  <TableCell>{qr.created_at}</TableCell>
                  <TableCell>{qr.updated_at}</TableCell>
                  <TableCell>
                    <Tooltip title="View QR Code">
                      <IconButton onClick={() => handleOpenView(qr)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredQrCodes.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
      <Modal open={openView} onClose={handleCloseView}>
        <Box
          p={4}
          bgcolor="background.paper"
          borderRadius={2}
          width="90%"
          maxWidth="600px"
          mx="auto"
          mt={4}
          style={{ outline: 'none' }}
        >
          {selectedQr && (
            <Box>
              <Typography variant="h6" gutterBottom>
                QR Code Details
              </Typography>
              <Box mb={3} display="flex" justifyContent="center">
                <QRCode value={selectedQr.qr_code} size={200} />
              </Box>
              <Box mb={2}>
                <Typography variant="body1" gutterBottom>
                  <strong>ID:</strong> {selectedQr.id}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Payment Reference:</strong> {selectedQr.payment_reference}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Amount:</strong> {selectedQr.amount}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Status:</strong> {selectedQr.status}
                </Typography>
                <Typography
                  variant="body1"
                  gutterBottom
                  style={{
                    whiteSpace: 'pre-wrap',
                    backgroundColor: '#f5f5f5',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }}
                >
                  <strong>Description:</strong> {selectedQr.description}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Created At:</strong> {selectedQr.created_at}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Updated At:</strong> {selectedQr.updated_at}
                </Typography>
                <Box mt={2} display="flex" justifyContent="flex-end">
                  <Button variant="contained" color="primary" onClick={handleCloseView}>
                    Close
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>

    </Container>
  );
};

export default ManageQrCA;

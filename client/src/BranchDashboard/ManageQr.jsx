import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import QRCode from 'qrcode.react';

const ManageQr = () => {
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

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchQrCodes = async () => {
      try {
        const token = localStorage.getItem('token');
        const userResponse = await axios.get(`${backendUrl}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = userResponse.data;
        setUserType(localStorage.getItem('userType'));

        const qrCodeResponse = await axios.get(`${backendUrl}/api/qr-codes/get`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const formattedQrCodes = qrCodeResponse.data.map((qr) => ({
          ...qr,
          user_name: qr.user ? qr.user.username : 'Unknown User',
          branch_name: qr.branch ? qr.branch.branch_name : 'Unknown Branch',
          created_at: qr.createdAt ? new Date(qr.createdAt).toLocaleString() : 'N/A',
          updated_at: qr.updatedAt ? new Date(qr.updatedAt).toLocaleString() : 'N/A',
        }));

        if (user.branch_id) {
          const filteredQrCodes = formattedQrCodes.filter(
            (qr) => qr.branch_id === user.branch_id
          );
          setQrCodes(filteredQrCodes);
          setFilteredQrCodes(filteredQrCodes);
        } else {
          setQrCodes(formattedQrCodes);
          setFilteredQrCodes(formattedQrCodes);
        }
      } catch (error) {
        console.error('Error fetching QR codes or user data:', error);
      }
    };

    fetchQrCodes();
  }, [backendUrl]);

  useEffect(() => {
    const fetchFilteredQrCodes = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/qr-codes/filter`, {
          params: {
            searchTerm,             
            branchFilter,           
            userFilter,             
            startDate: dateFilter.startDate,
            endDate: dateFilter.endDate,
          },
        });

        const data = Array.isArray(response.data) ? response.data : [];
        setFilteredQrCodes(data);
      } catch (error) {
        console.error('Error fetching filtered QR codes:', error);
        setFilteredQrCodes([]);
      }
    };

    fetchFilteredQrCodes();
  }, [searchTerm, branchFilter, userFilter, dateFilter]);

  useEffect(() => {
    const fetchBranchesAndUsers = async () => {
      try {
        const [branchesResponse, usersResponse] = await Promise.all([
          axios.get(`${backendUrl}/branches/all`),
          axios.get(`${backendUrl}/users/all`),
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

  const handleOpenDelete = (qr) => {
    setSelectedQr(qr);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setSelectedQr(null);
  };

  const handleDateChange = (event) => {
    setDateFilter({
      ...dateFilter,
      [event.target.name]: event.target.value,
    });
  };

  const styles = {
    container: {
      maxWidth: '100%',
      padding: '0 16px',
    },
    tableContainer: {
      width: '100%',
      overflowX: 'auto',
    },
    table: {
      minWidth: 700,
    },
    csvButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    exportContainer: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
      marginBottom: '16px',
    },
  };

  const headers = [
    { label: 'ID', key: 'id' },
    { label: 'QR Code', key: 'qr_code' },
    { label: 'Payment Reference', key: 'payment_reference' },
    { label: 'Amount', key: 'amount' },
    { label: 'Status', key: 'status' },
    { label: 'User Name', key: 'user_name' },
    { label: 'Branch Name', key: 'branch_name' },
    { label: 'Description', key: 'description' },
    { label: 'Created At', key: 'created_at' },
    { label: 'Updated At', key: 'updated_at' },
  ];

  return (
    <Container style={styles.container}>
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Manage QR Codes
        </Typography>
        {(userType === 'admin' || userType === 'Co-Admin') && (
          <Box style={styles.exportContainer}>
            <TextField
              label="Search Payment Reference"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FormControl variant="outlined" fullWidth>
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

            <FormControl variant="outlined" fullWidth>
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

            <TextField
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              fullWidth
              name="startDate"
              value={dateFilter.startDate}
              onChange={handleDateChange}
            />
            <TextField
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              fullWidth
              name="endDate"
              value={dateFilter.endDate}
              onChange={handleDateChange}
            />
            <Button
              variant="contained"
              color="primary"
              style={styles.csvButton}
              startIcon={<DownloadIcon />}
            >
              <CSVLink
                headers={headers}
                data={filteredQrCodes}
                filename="qr_codes.csv"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                Export CSV
              </CSVLink>
            </Button>
          </Box>
        )}
        <TableContainer component={Paper} style={styles.tableContainer}>
          <Table style={styles.table} aria-label="QR Code Table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Payment Reference</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>User Name</TableCell>
                <TableCell>Branch Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Updated At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredQrCodes
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((qr) => (
                  <TableRow key={qr.id}>
                    <TableCell>{qr.id}</TableCell>
                    <TableCell>{qr.payment_reference}</TableCell>
                    <TableCell>{qr.amount}</TableCell>
                    <TableCell>{qr.status}</TableCell>
                    <TableCell>{qr.user.username || 'N/A'}</TableCell>
                    <TableCell>{qr.branch_name || 'N/A'}</TableCell>
                    <TableCell>{qr.description || 'N/A'}</TableCell>
                    <TableCell>{qr.created_at}</TableCell>
                    <TableCell>{qr.updated_at}</TableCell>
                    <TableCell>
                      <Tooltip title="View">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenView(qr)}
                        >
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
          component="div"
          count={filteredQrCodes.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>

      {/* View QR Modal */}
      <Modal open={openView} onClose={handleCloseView}>
        <Box
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            backgroundColor: 'white',
            padding: 24,
            boxShadow: 24,
            outline: 'none',
            borderRadius: '8px',
          }}
        >
          <Typography variant="h6" gutterBottom>
            QR Code Details
          </Typography>
          {selectedQr && (
            <>
              <QRCode value={selectedQr.qr_code} size={200} />
              <Typography variant="body1" mt={2}>
                Payment Reference: {selectedQr.payment_reference}
              </Typography>
              <Typography variant="body1">Amount: {selectedQr.amount}</Typography>
              <Typography variant="body1">Status: {selectedQr.status}</Typography>
              <Typography variant="body1">
                Created At: {selectedQr.created_at ? new Date(selectedQr.created_at).toLocaleString() : 'N/A'}
              </Typography>
              <Typography variant="body1">
                Updated At: {selectedQr.updated_at ? new Date(selectedQr.updated_at).toLocaleString() : 'N/A'}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleCloseView}
                style={{ marginTop: 16 }}
              >
                Close
              </Button>
            </>
          )}
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
        {/* Delete QR Code Confirmation Modal */}
      <Modal open={openDelete} onClose={handleCloseDelete}>
        <Box style={styles.modalBox}>
          <Typography variant="h6">Are you sure you want to delete this QR code?</Typography>
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                // Handle delete logic here
                handleCloseDelete();
              }}
            >
              Yes
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleCloseDelete}
              style={{ marginLeft: '8px' }}
            >
              No
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default ManageQr;

import React, { useState, useEffect } from 'react';
import {
  Box, Button, Container, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, Typography, IconButton, Tooltip, CircularProgress
} from '@mui/material';
import { Visibility as ViewIcon,} from '@mui/icons-material';
import axios from 'axios';
import QRCode from 'qrcode.react';
import { io } from 'socket.io-client';
import RippleLoader from '../Components/Loader';

const ManageQRBU = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [filteredQrCodes, setFilteredQrCodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedQr, setSelectedQr] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openView, setOpenView] = useState(false);
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
      
          // Fetch user profile (which includes branch_id)
          const userResponse = await axios.get(`${backendUrl}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userData = userResponse.data;
          const branchId = userData.branch_id;
      
          // If branch ID is missing, throw an error (this page should be accessed by branch users only)
          if (!branchId) {
            console.error('Error: No branch ID found for the user.');
            return;
          }
      
          // Fetch QR codes for the user's branch
          const qrCodeResponse = await axios.get(`${backendUrl}/api/qr-codes/get_qr_bu`, {
            headers: { Authorization: `Bearer ${token}` },
          });
      
          // Format and filter the QR codes for the user's branch
          const formattedQrCodes = qrCodeResponse.data
            .filter((qr) => qr.branch_id === branchId) // Only keep QR codes for the user's branch
            .map((qr) => ({
              ...qr,
              user_name: qr.user ? qr.user.username : 'Unknown User',
              branch_name: qr.branch ? qr.branch.branch_name : 'Unknown Branch',
              created_at: qr.createdAt ? new Date(qr.createdAt).toLocaleString() : 'N/A',
              updated_at: qr.updatedAt ? new Date(qr.updatedAt).toLocaleString() : 'N/A',
            }));
      
          // Update state with filtered and formatted QR codes
          setQrCodes(formattedQrCodes);
          setFilteredQrCodes(formattedQrCodes);
      
        } catch (error) {
          console.error('Error fetching QR codes or user data:', error);
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
      <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
          Manage QR Codes
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
            <TableRow>
                <TableCell sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>ID</TableCell>
                <TableCell sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>QR Code</TableCell>
                <TableCell sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>Payment Reference</TableCell>
                <TableCell sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>Amount</TableCell>
                <TableCell sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>Status</TableCell>
                <TableCell sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>Description</TableCell>
                <TableCell sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>Created At</TableCell>
                <TableCell sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>Updated At</TableCell>
                <TableCell sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredQrCodes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((qr, index) => (
                <TableRow key={qr.id || `qr-${index}`}>
                <TableCell sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{qr.id}</TableCell>
                <TableCell>
                  <QRCode value={qr.qr_code} size={50} />
                </TableCell>
                <TableCell sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{qr.payment_reference}</TableCell>
                <TableCell sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{qr.amount}</TableCell>
                <TableCell sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{qr.status}</TableCell>
                <TableCell sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }} style={{ whiteSpace: 'pre-wrap' }}>
                  {qr.description}
                </TableCell>
                <TableCell sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{qr.created_at}</TableCell>
                <TableCell sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>{qr.updated_at}</TableCell>
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
            <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
              QR Code Details
            </Typography>
            <Box mb={3} display="flex" justifyContent="center">
              <QRCode value={selectedQr.qr_code} size={200} />
            </Box>
            <Box mb={2}>
              <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
                <strong>ID:</strong> {selectedQr.id}
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
                <strong>Payment Reference:</strong> {selectedQr.payment_reference}
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
                <strong>Amount:</strong> {selectedQr.amount}
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
                <strong>Status:</strong> {selectedQr.status}
              </Typography>
              <Typography
              sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
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
              <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
                <strong>Created At:</strong> {selectedQr.created_at}
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
                <strong>Updated At:</strong> {selectedQr.updated_at}
              </Typography>
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button variant="contained" color="primary" onClick={handleCloseView} sx={{
                          maxWidth: '150px',
                          flex: 1,
                          backgroundColor: '#FBB03A',
                          color: 'black',
                          '&:hover': {
                            backgroundColor: '#ED1F79',
                          },
                          fontFamily: 'Montserrat, sans-serif',
                          fontWeight: 400,
                        }}
                      >
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
export default ManageQRBU;

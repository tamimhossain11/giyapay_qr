import React, { useState, useEffect } from 'react';
import { Button, Table, TableHead, TableBody, TableRow, TableCell, Box, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, useMediaQuery, CircularProgress, Snackbar, Alert } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RippleLoader from '../Components/RIppleLoader';

const ManageBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Can be 'error' or 'success'
  const isTabletOrMobile = useMediaQuery('(max-width: 900px)');
  const location = useLocation();

  // Fetch all branches when component mounts
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/branches/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBranches(response.data);
      } catch (error) {
        console.error('Failed to fetch branches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  // Handle successful branch create or edit
  useEffect(() => {
    if (location.state && location.state.successMessage) {
      setSnackbarMessage(location.state.successMessage);
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    }
  }, [location]);

  // Open delete confirmation dialog
  const openDeleteDialog = (branch) => {
    setBranchToDelete(branch);
    setDeleteDialogOpen(true);
  };

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setBranchToDelete(null);
  };

  // Handle branch deletion
  const handleDelete = async () => {
    if (!branchToDelete) return;

    try {
      const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/branches/${branchToDelete.id}`);
      setBranches(branches.filter((branch) => branch.id !== branchToDelete.id));
      setSnackbarMessage(response.data.message);
      setOpenSnackbar(true);
      closeDeleteDialog();
    } catch (error) {
      console.error('Failed to delete branch:', error);
      setSnackbarMessage(error.response?.data?.message || 'Failed to delete branch');
      setOpenSnackbar(true);
    }
  };

  return (
    <Box p={3}>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <RippleLoader />
        </Box>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Manage Branches
          </Typography>
  
          <Button
            component={Link}
            to="/super-dashboard/manage-branches/add"
            variant="contained"
            color="primary"
            sx={{ mb: 3, maxWidth: '200px' }}
          >
            Create Branch
          </Button>
  
          {branches.length === 0 ? (
            <Typography>No branches found. Create a new branch to get started.</Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size={isTabletOrMobile ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Branch Name</TableCell>
                    <TableCell>Bank Name</TableCell>
                    <TableCell>Bank Branch</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {branches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>{branch.id}</TableCell>
                      <TableCell>{branch.branch_name}</TableCell>
                      <TableCell>{branch.bank_name}</TableCell>
                      <TableCell>{branch.bank_branch}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            component={Link}
                            to={`/super-dashboard/edit-branch/${branch.id}`}
                            variant="contained"
                            color="primary"
                            sx={{ maxWidth: '150px', flex: 1 }}
                            startIcon={<EditIcon />}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => openDeleteDialog(branch)}
                            sx={{ maxWidth: '150px', flex: 1 }}
                            startIcon={<DeleteIcon />}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </>
      )}
  
      {/* Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Delete Branch</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this branch? If there are users associated with this branch, you must delete them first.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
  
      {/* Snackbar for Success/Error */}
      <Snackbar
        open={openSnackbar}
        onClose={() => setOpenSnackbar(false)}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbarSeverity} onClose={() => setOpenSnackbar(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}  

export default ManageBranches;






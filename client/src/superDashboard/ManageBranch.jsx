import React, { useState, useEffect } from 'react';
import { Button, Table, TableHead, TableBody, TableRow, TableCell, Box, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, useMediaQuery, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ManageBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);  // Add loading state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const isTabletOrMobile = useMediaQuery('(max-width: 900px)');

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/branches/all`);
        setBranches(response.data);
      } catch (error) {
        console.error('Failed to fetch branches:', error);
      } finally {
        setLoading(false);  // Stop loading after data is fetched
      }
    };

    fetchBranches();
  }, []);

  const openDeleteDialog = (branch) => {
    setBranchToDelete(branch);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setBranchToDelete(null);
  };

  const handleDelete = async () => {
    if (!branchToDelete) return;

    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/branches/${branchToDelete.id}`);
      setBranches(branches.filter((branch) => branch.id !== branchToDelete.id));
      closeDeleteDialog();
    } catch (error) {
      console.error('Failed to delete branch:', error);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Manage Branches
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
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
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>Delete Branch</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this branch?
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
    </Box>
  );
};

export default ManageBranches;

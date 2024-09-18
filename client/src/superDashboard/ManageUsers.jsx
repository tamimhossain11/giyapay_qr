import React, { useState, useEffect } from 'react';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  useMediaQuery,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width: 600px)');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/all`);
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/users/delete/${selectedUserId}`);
      setUsers(users.filter((user) => user.id !== selectedUserId));
      setOpen(false);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleClickOpen = (id) => {
    setSelectedUserId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/users/edit_status/${id}`, {
        status: currentStatus === 'Active' ? 'Inactive' : 'Active',
      });
      setUsers(users.map(user => user.id === id ? { ...user, status: currentStatus === 'Active' ? 'Inactive' : 'Active' } : user));
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Manage Users
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to="/super-dashboard/manage-users/add"
        sx={{ mb: 3, maxWidth: '200px' }}
      >
        Add User
      </Button>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size={isMobile ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>User Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.first_name}</TableCell>
                  <TableCell>{user.last_name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.user_type}</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>
                    {user.user_type === 'Co-Admin'
                      ? 'Bank'
                      : user.branch
                        ? user.branch.branch_name
                        : 'No Branch Assigned'}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1} flexDirection={isMobile ? 'column' : 'row'}>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleClickOpen(user.id)}
                        sx={{ maxWidth: '150px' }}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        component={Link}
                        to={`/super-dashboard/edit-users/${user.id}`}
                        sx={{ maxWidth: '150px' }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        color={user.status === 'Active' ? 'success' : 'inherit'}
                        onClick={() => toggleStatus(user.id, user.status)}
                        sx={{ maxWidth: '150px' }}
                      >
                        {user.status === 'Active' ? 'Active' : 'Inactive'}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
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

export default ManageUsers;

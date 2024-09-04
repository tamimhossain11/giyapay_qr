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
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);  // State for dialog visibility
  const [selectedUserId, setSelectedUserId] = useState(null);  // State for the selected user ID for deletion
  const isMobile = useMediaQuery('(max-width: 600px)');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/users/all');
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/users/delete/${selectedUserId}`);
      setUsers(users.filter((user) => user.id !== selectedUserId));
      setOpen(false);  // Close the dialog after deletion
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleClickOpen = (id) => {
    setSelectedUserId(id);
    setOpen(true);  // Open the dialog
  };

  const handleClose = () => {
    setOpen(false);  // Close the dialog without deleting
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(`http://localhost:3000/users/edit_status/${id}`, {
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
      <Box sx={{ overflowX: 'auto' }}>
        <Table size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
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
                <TableCell>{user.first_name}</TableCell>
                <TableCell>{user.last_name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.user_type}</TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell>{user.branch ? user.branch.branch_name : 'Bank'}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1} flexDirection={isMobile ? 'column' : 'row'}>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleClickOpen(user.id)}  // Trigger dialog on delete click
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
                      color={user.status === 'Active' ? 'warning' : 'success'}
                      onClick={() => toggleStatus(user.id, user.status)}
                      sx={{ maxWidth: '150px' }}
                    >
                      {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
      >
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

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    branchName: '',
    userName: '',
    refno: '',
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:3000/transaction/transactions', {
        params: filters,
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date, field) => {
    setFilters({ ...filters, [field]: date });
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await axios.get('http://localhost:3000/transaction/transactions/csv', {
        params: filters,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.csv');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  };

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Transactions
        </Typography>
        <Box mb={3}>
          <Grid container spacing={2} alignItems="center">
            {/* Adjust grid items for better organization on tablets */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Branch Name"
                name="branchName"
                value={filters.branchName}
                onChange={handleFilterChange}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="User Name"
                name="userName"
                value={filters.userName}
                onChange={handleFilterChange}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Reference No"
                name="refno"
                value={filters.refno}
                onChange={handleFilterChange}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(date) => handleDateChange(date, 'startDate')}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth size="small" />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate}
                  onChange={(date) => handleDateChange(date, 'endDate')}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth size="small" />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            {/* Align buttons in a separate row with spacing */}
            <Grid item xs={12} sm={12} md={4} container spacing={1} justifyContent="flex-end">
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={fetchTransactions}
                  sx={{ mt: { xs: 2, md: 0 }, mb: 2 }}
                  fullWidth
                >
                  Apply Filters
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleDownloadCSV}
                  sx={{ mt: { xs: 2, md: 0 }, mb: 2 }}
                  fullWidth
                >
                  Download CSV
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Box>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Reference No</TableCell>
                <TableCell align="right">Branch Name</TableCell>
                <TableCell align="right">User Name</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Timestamp</TableCell>
                <TableCell align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.refno}</TableCell>
                  <TableCell align="right">{transaction.branch_name}</TableCell>
                  <TableCell align="right">{transaction.user_name}</TableCell>
                  <TableCell align="right">{transaction.amount}</TableCell>
                  <TableCell align="right">{new Date(transaction.timestamp).toLocaleString()}</TableCell>
                  <TableCell align="right">{transaction.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default Transaction;

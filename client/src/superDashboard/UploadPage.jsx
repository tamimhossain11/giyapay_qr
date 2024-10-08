import React, { useState } from 'react'; 
import axios from 'axios';
import { Button, Card, Grid, Typography, Box, Alert, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState(false);
  const [uploadType, setUploadType] = useState('');

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadStatus('');
    setUploadError(false);
  };

  const handleUpload = async (endpoint) => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first.');
      setUploadError(true);
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authorization token is missing.');
      }

      const response = await axios.post(`${backendUrl}/upload/${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
      });

      setUploadStatus(response.data.message);
      setUploadError(false);
    } catch (error) {
      if (error.response && error.response.data) {
        setUploadStatus(`Upload failed: ${error.response.data.error || error.response.data.message}`);
      } else {
        setUploadStatus('Error uploading file.');
      }
      setUploadError(true);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '800px', mx: 'auto', p: 3 }}>
      <Card elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>Batch Upload</Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined" required sx={{ mb: 2 }}>
              <InputLabel id="upload-type-label">Upload Type</InputLabel>
              <Select
                labelId="upload-type-label"
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                label="Upload Type"
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="users">Upload Users</MenuItem>
                <MenuItem value="branches">Upload Branches</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body1" sx={{ mt: 2 }}>Please upload your Excel files:</Typography>
          </Grid>

          <Grid item xs={12}>
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
              Select Excel File
              <input type="file" onChange={handleFileChange} accept=".xlsx, .xls" hidden />
            </Button>
          </Grid>

          <Grid item xs={12}>
            {selectedFile && (
              <Typography variant="body2" color="textSecondary">
                Selected File: {selectedFile.name}
              </Typography>
            )}
          </Grid>

          {uploadType && (
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => handleUpload(uploadType === 'users' ? 'upload-users' : 'upload-branches')}
              >
                {uploadType === 'users' ? 'Upload Users' : 'Upload Branches'}
              </Button>
            </Grid>
          )}

          <Grid item xs={12}>
            {uploadStatus && (
              <Alert severity={uploadError ? 'error' : 'success'}>
                {uploadStatus}
              </Alert>
            )}
          </Grid>

          <Grid item xs={12} sx={{ mt: 3 }}>
            <Typography variant="body1">Download Sample Excel Files:</Typography>
            <Button
              variant="text"
              startIcon={<FileDownloadIcon />}
              href="/sample-users.xlsx"
              download
            >
              Download Users Sample
            </Button>
            <Button
              variant="text"
              startIcon={<FileDownloadIcon />}
              href="/sample-branches.xlsx"
              download
            >
              Download Branches Sample
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default UploadPage;

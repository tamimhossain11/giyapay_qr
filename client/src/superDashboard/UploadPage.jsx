import React, { useState } from 'react';
import axios from 'axios';
import { Button, Card, Grid, Typography, Box, Alert, Select, MenuItem, FormControl, InputLabel, Autocomplete } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RippleLoader from '../Components/Loader'
import CustomTextField from '../Mui/CustomTextField';

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState(false);
  const [uploadType, setUploadType] = useState('');
  const [loading, setLoading] = useState(false);

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

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authorization token is missing.');
      }

      const response = await axios.post(`${backendUrl}/upload/${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '800px', mx: 'auto', p: 3 }} >
      <Card elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, mb: 3, textAlign: 'center' }}>Batch Upload</Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={3}>
            <RippleLoader />
          </Box>
        ) : (
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <Autocomplete
                options={[
                  { value: '', label: 'None' },
                  { value: 'users', label: 'Upload Users' },
                  { value: 'branches', label: 'Upload Branches' },
                ]}
                getOptionLabel={(option) => option.label}
                value={uploadType ? { value: uploadType, label: uploadType === 'users' ? 'Upload Users' : 'Upload Branches' } : { value: '', label: 'None' }}
                onChange={(event, newValue) => setUploadType(newValue ? newValue.value : '')}
                renderInput={(params) => (
                  <CustomTextField
                    {...params}
                    label="Upload Type"
                    variant="outlined"
                    fullWidth
                    required
                  />
                )}
                sx={{ mb: 2 }}
              />

            </Grid>

            <Grid item xs={12}>
              <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, mt: 2 }}>Please upload your Excel files:</Typography>
            </Grid>

            <Grid item xs={12}>
              <Button variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{
                  flex: 1,
                  backgroundColor: '#b3b3b3',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#FBB03A',
                  },
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 400,
                }}
              >
                Select Excel File
                <input type="file" onChange={handleFileChange} accept=".xlsx, .xls" hidden />
              </Button>
            </Grid>

            <Grid item xs={12}>
              {selectedFile && (
                <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
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
                  sx={{
                    color: '#fff',
                    backgroundImage: 'linear-gradient(to right, #FBB03A, #ED1F79, #FBB03A, #ED1F79)',
                    backgroundSize: '300% 100%',
                    border: 'none',
                    transition: 'all 0.4s ease-in-out',
                    borderRadius: '8px',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 400,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundPosition: '100% 0',
                    },
                  }}
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
              <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
                Download Sample Excel Files:
              </Typography>
              <Box
                display="flex"
                gap={2}
                mt={2}
                flexDirection={{ xs: 'column', sm: 'row' }}
                width="100%"
              >
                <Button
                  variant="text"
                  startIcon={<FileDownloadIcon />}
                  href="/sample-users.xlsx"
                  download
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    backgroundColor: '#b3b3b3',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#FBB03A',
                    },
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 400,
                    textAlign: 'center',
                    fontSize: { xs: '14px', sm: '15px', md: '16px' },
                    padding: { xs: '10px', sm: '8px 18px', md: '8px 24px' },
                    minHeight: { sm: '40px', md: '42px' },
                  }}
                >
                  Download Users Sample
                </Button>

                <Button
                  variant="text"
                  startIcon={<FileDownloadIcon />}
                  href="/sample-branches.xlsx"
                  download
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    backgroundColor: '#b3b3b3',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#FBB03A',
                    },
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 400,
                    textAlign: 'center',
                    fontSize: { xs: '14px', sm: '15px', md: '16px' },
                    padding: { xs: '10px', sm: '8px 18px', md: '8px 24px' },
                    minHeight: { sm: '40px', md: '42px' },
                  }}
                >
                  Download Branches Sample
                </Button>
              </Box>

            </Grid>

          </Grid>
        )}
      </Card>
    </Box>
  );
};

export default UploadPage;

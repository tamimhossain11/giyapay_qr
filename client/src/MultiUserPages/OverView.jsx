import axios from 'axios';
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/home.css';
import { FaUser, FaQrcode, FaBuilding } from 'react-icons/fa';

const OverView = () => {
  const [adminTotal, setAdminTotal] = useState(0);
  const [qrTotal, setQrTotal] = useState(0);
  const [branchTotal, setBranchTotal] = useState(0); 

  useEffect(() => {
    adminCount();
    qrCount();
    branchCount();
  }, []);

  const adminCount = async () => {
    try {
      const result = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/count`);
      if (result.data.Status) {
        setAdminTotal(result.data.Result);
      }
    } catch (error) {
      console.error('Error fetching admin count:', error);
    }
  };

  const qrCount = async () => {
    try {
      const result = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/qr-codes/count`);
      if (result.data.Status) {
        setQrTotal(result.data.Result);
      }
    } catch (error) {
      console.error('Error fetching QR code count:', error);
    }
  };

  const branchCount = async () => {
    try {
      const result = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/branches/count`);
      if (result.data.Status) {
        setBranchTotal(result.data.Result);
      }
    } catch (error) {
      console.error('Error fetching branch count:', error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-4">
          <div className="card shadow-sm text-center p-3 mb-4">
            <FaBuilding size={50} className="icon text-success mb-3" />
            <h5 className="card-title">Branches</h5>
            <p className="card-text">Total: {branchTotal}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm text-center p-3 mb-4">
            <FaQrcode size={50} className="icon text-info mb-3" />
            <h5 className="card-title">QR Codes</h5>
            <p className="card-text">Total: {qrTotal}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm text-center p-3 mb-4">
            <FaUser size={50} className="icon text-primary mb-3" />
            <h5 className="card-title">Admins</h5>
            <p className="card-text">Total: {adminTotal}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverView;

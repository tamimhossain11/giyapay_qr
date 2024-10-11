import axios from 'axios';
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import CountUp from 'react-countup'; // Import CountUp for animation
import '../css/home.css'; // Ensure this file includes your custom styles
import { FaQrcode, FaBuilding, FaUsers } from 'react-icons/fa';

const OverView = () => {
  const [qrTotal, setQrTotal] = useState(0);
  const [branchTotal, setBranchTotal] = useState(0);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    qrCount();
    branchCount();
    userCountFetch();
  }, []);

  const qrCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization token is missing.');

      const result = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/qr-codes/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (result.data.Status) setQrTotal(result.data.Result);
    } catch (error) {
      console.error('Error fetching QR code count:', error);
    }
  };

  const branchCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization token is missing.');

      const result = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/branches/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (result.data.Status) setBranchTotal(result.data.Result);
    } catch (error) {
      console.error('Error fetching branch count:', error);
    }
  };

  const userCountFetch = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization token is missing.');

      const result = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (result.data.Status) setUserCount(result.data.Result);
    } catch (error) {
      console.error('Error fetching user count:', error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-3 col-md-6 col-sm-12">
          <div className="card shadow-sm text-center p-4 overview-card mb-4">
            <FaBuilding className="icon text-success mb-3" />
            <h5 className="card-title">Branches</h5>
            <p className="card-text">
              <CountUp start={0} end={branchTotal} duration={3} separator="," />
            </p>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 col-sm-12">
          <div className="card shadow-sm text-center p-4 overview-card mb-4">
            <FaUsers className="icon text-warning mb-3" />
            <h5 className="card-title">Users</h5>
            <p className="card-text">
              <CountUp start={0} end={userCount} duration={3} separator="," />
            </p>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 col-sm-12">
          <div className="card shadow-sm text-center p-4 overview-card mb-4">
            <FaQrcode className="icon text-info mb-3" />
            <h5 className="card-title">QR Codes</h5>
            <p className="card-text">
              <CountUp start={0} end={qrTotal} duration={3} separator="," />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverView;

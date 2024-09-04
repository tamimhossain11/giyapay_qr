import axios from 'axios';
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/home.css';
import { FaUser, FaQrcode, FaDollarSign, FaBuilding, FaUsers, FaUserShield } from 'react-icons/fa';

const OverView = () => {
  const [adminTotal, setAdminTotal] = useState(0);
  {/*
  const [branchUserTotal, setBranchUserTotal] = useState(0);
  const [coAdminTotal, setCoAdminTotal] = useState(0);
   */}
  const [qrTotal, setQrTotal] = useState(0);
  const [transactionTotal, setTransactionTotal] = useState(0);
  const [branchTotal, setBranchTotal] = useState(0);  // State for branch count

  useEffect(() => {
    adminCount();
    {/*
    branchUserCount();
    coAdminCount();
    */}
    qrCount();
    transactionCount();
    branchCount();  // Fetch branch count
  }, []);

  const adminCount = () => {
    axios.get('http://localhost:3000/admin/count')
      .then(result => {
        if (result.data.Status) {
          setAdminTotal(result.data.Result);
        }
      });
  };
{/* 
  const branchUserCount = () => {
    axios.get('http://localhost:3000/users/branchUserCount')
      .then(result => {
        if (result.data.Status) {
          setBranchUserTotal(result.data.Result);
        }
      }).catch(error => console.error('Error fetching branch user count:', error));
  };

  const coAdminCount = () => {
    axios.get('http://localhost:3000/users/co-admin-count')
      .then(result => {
        if (result.data.Status) {
          setCoAdminTotal(result.data.Result);
        }
      }).catch(error => console.error('Error fetching co-admin count:', error));
  };
*/}
  const qrCount = () => {
    axios.get('http://localhost:3000/api/qr-codes/count')
      .then(result => {
        if (result.data.Status) {
          setQrTotal(result.data.Result);
        }
      }).catch(error => console.error('Error fetching QR code count:', error));
  };

  const transactionCount = () => {
    axios.get('http://localhost:3000/transaction/count')
      .then(result => {
        if (result.data.Status) {
          setTransactionTotal(result.data.Result);
        }
      }).catch(error => console.error('Error fetching transaction count:', error));
  };

  const branchCount = () => {
    axios.get('http://localhost:3000/branches/count')
      .then(result => {
        if (result.data.Status) {
          setBranchTotal(result.data.Result);
        }
      }).catch(error => console.error('Error fetching branch count:', error));
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
         {/* 
        <div className="col-md-4">
          <div className="card shadow-sm text-center p-3 mb-4">
            <FaDollarSign size={50} className="icon text-warning mb-3" />
            <h5 className="card-title">Transactions</h5>
            <p className="card-text">Total: {transactionTotal}</p>
          </div>
        </div>
      </div>
      <div className="row">
       */}
        <div className="col-md-4">
          <div className="card shadow-sm text-center p-3 mb-4">
            <FaUser size={50} className="icon text-primary mb-3" />
            <h5 className="card-title">Admins</h5>
            <p className="card-text">Total: {adminTotal}</p>
          </div>
        </div>
        {/* 
        <div className="col-md-4">
          <div className="card shadow-sm text-center p-3 mb-4">
            <FaUsers size={50} className="icon text-info mb-3" />
            <h5 className="card-title">Branch Users</h5>
            <p className="card-text">Total: {branchUserTotal}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm text-center p-3 mb-4">
            <FaUserShield size={50} className="icon text-danger mb-3" />
            <h5 className="card-title">Co-Admins</h5>
            <p className="card-text">Total: {coAdminTotal}</p>
          </div>
        </div>
        */}
      </div>
    </div>
  );
};

export default OverView;

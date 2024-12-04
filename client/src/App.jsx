import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Login from './Components/Login';
import SuperDashboard from './superDashboard/SuperDashboard';
import OverView from './MultiUserPages/OverView';
import PrivateRoute from './Components/PrivateRoute';
import AddQr from './BranchDashboard/AddQr';
import ManageQr from './BranchDashboard/ManageQr';
import AddBranchForm from './superDashboard/AddBranch';
import BranchManagement from './superDashboard/ManageBranch';
import BranchDashboard from './BranchDashboard/BranchDashboard';
import ProfilePage from './MultiUserPages/ProfilePage';
import ManageUsers from './superDashboard/ManageUsers';
import MerchantManagement from './superDashboard/MerchantManagement';
import AddUser from './superDashboard/AddUsers';
import EditUser from './Components/EditUser';
import EditBranch from './Components/EditBranch';
import CallbackResponsePage from './ClientPages/CallbackResponsePage';
import CoAdminDashboard from './CoAdminDashboard/CoAdminDashboard';
import NotFound from './Components/NotFound';
import ManageQRBU from './BranchDashboard/ManageQRBU';
import ManageQrCA from './CoAdminDashboard/ManageQrCA';
import UploadPage from './superDashboard/UploadPage';
import AfterSales from './MultiUserPages/AfterSales';

function App() {
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                if (Date.now() >= decodedToken.exp * 1000) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userType');
                    localStorage.removeItem('expirationTime');
                    window.location.href = '/';
                }
            } catch (error) {
                console.error('Error decoding token:', error);

                localStorage.removeItem('token');
                localStorage.removeItem('userType');
                localStorage.removeItem('expirationTime');
                window.location.href = '/';
            }
        }
    }, []);

    return (
        <BrowserRouter>

            <Routes>

                {/* Merchant Management route - independently protected */}
                <Route
                    path="/merchant-management"
                    element={
                        <PrivateRoute expectedUserType="admin">
                            <MerchantManagement />
                        </PrivateRoute>
                    }
                />
                {/* Public routes */}
                <Route path="/" element={<Login />} />
                <Route path="/callback/:callbackType" element={<CallbackResponsePage />} />

                {/*Super Admin routes */}
                <Route
                    path="/super-dashboard/*"
                    element={
                        <PrivateRoute expectedUserType="admin">
                            <SuperDashboard />
                        </PrivateRoute>
                    }
                >
                    <Route path="" element={<OverView />} />
                    <Route path="manage-branches" element={<BranchManagement />} />
                    <Route path="manage-branches/add" element={<AddBranchForm />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="aftersales" element={<AfterSales />} />
                    <Route path="manage-users" element={<ManageUsers />} />
                    <Route path="manage-users/add" element={<AddUser />} />
                    <Route path="edit-users/:id" element={<EditUser />} />
                    <Route path="edit-branch/:id" element={<EditBranch />} />
                    <Route path="manage-qr" element={<ManageQr />} />
                    <Route path="upload" element={<UploadPage />} />
                </Route>

                {/* Co-Admin routes */}
                <Route
                    path="/co-admin-dashboard/*"
                    element={
                        <PrivateRoute expectedUserType="Co-Admin">
                            <CoAdminDashboard />
                        </PrivateRoute>
                    }
                >
                    <Route path="" element={<OverView />} />
                    <Route path="manage-qr-ca" element={<ManageQrCA />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="aftersales" element={<AfterSales />} />
                </Route>

                {/* Branch User routes */}
                <Route
                    path="/branch-dashboard/*"
                    element={
                        <PrivateRoute expectedUserType="Branch User">
                            <BranchDashboard />
                        </PrivateRoute>
                    }
                >
                    <Route path="" element={<ManageQRBU />} />
                    <Route path="manage-qrbu" element={<ManageQRBU />} />
                    <Route path="add-qr" element={<AddQr />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="aftersales" element={<AfterSales />} />
                </Route>

                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

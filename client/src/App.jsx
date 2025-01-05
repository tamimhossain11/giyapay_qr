import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Login from './Components/Forms/Login';
import SuperDashboard from './Dashboards/AdminDashboard';
import OverView from './Pages/OverView';
import PrivateRoute from './Components/PrivateRoute';
import AddQr from './Components/Forms/AddQr';
import ManageQr from './Pages/ManageQr';
import AddBranchForm from './Components/Forms/AddBranch';
import BranchManagement from './Pages/ManageBranch';
import BranchDashboard from './Dashboards/BranchDashboard';
import ProfilePage from './Pages/ProfilePage';
import ManageUsers from './Pages/ManageUsers';
import MerchantManagement from './Dashboards/MerchantManagement';
import AddUser from './Components/Forms/AddUsers';
import EditUser from './Components/Forms/EditUser';
import EditBranch from './Components/Forms/EditBranch';
import CallbackResponsePage from './Pages/CallbackResponsePage';
import CoAdminDashboard from './Dashboards/CoAdminDashboard';
import NotFound from './Pages/NotFound';
import ManageQrBU from './Pages/ManageQRBU';
import ManageQrCA from './Pages/ManageQrCA';
import UploadPage from './Pages/UploadPage';
import AfterSales from './Pages/AfterSales';

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
                    <Route path="" element={<ManageQrBU />} />
                    <Route path="manage-qrbu" element={<ManageQrBU />} />
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

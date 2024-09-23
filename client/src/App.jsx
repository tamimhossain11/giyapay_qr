import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

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
import AddAdmin from './superDashboard/AddAdmin';
import AddUser from './superDashboard/AddUsers';
import EditUser from './Components/EditUser';
import EditBranch from './Components/EditBranch';
import CallbackResponsePage from './ClientPages/CallbackResponsePage';
import CoAdminDashboard from './CoAdminDashboard/CoAdminDashboard';

function App() {
    useEffect(() => {
        const token = localStorage.getItem('token');
    
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
    
                // Check if the token has expired
                if (Date.now() >= decodedToken.exp * 1000) {
                    // Token has expired, clear storage and redirect
                    localStorage.removeItem('token');
                    localStorage.removeItem('userType');
                    localStorage.removeItem('expirationTime');
                    window.location.href = '/'; // Redirect to login
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                // Invalidate session on token decoding error
                localStorage.removeItem('token');
                localStorage.removeItem('userType');
                localStorage.removeItem('expirationTime');
                window.location.href = '/'; // Redirect to login
            }
        }
    }, []);    

    return (
        <BrowserRouter>
            <Routes>
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
                    <Route path="manage-users" element={<ManageUsers />} />
                    <Route path="manage-users/add" element={<AddUser />} />
                    <Route path="edit-users/:id" element={<EditUser />} />
                    <Route path="edit-branch/:id" element={<EditBranch />} />
                    <Route path="manage-qr" element={<ManageQr />} />
                    <Route path="admin/add" element={<AddAdmin />} />
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
                    <Route path="manage-qr" element={<ManageQr />} />
                    <Route path="profile" element={<ProfilePage />} />
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
                    <Route path="" element={<ManageQr />} />
                    <Route path="manage-qr" element={<ManageQr />} />
                    <Route path="add-qr" element={<AddQr />} />
                    <Route path="profile" element={<ProfilePage />} />
                </Route>

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

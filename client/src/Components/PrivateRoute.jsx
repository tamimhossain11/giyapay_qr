import React from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

function PrivateRoute({ children, expectedUserType }) {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    const expirationTime = localStorage.getItem('expirationTime');

    if (token && expirationTime && Date.now() < expirationTime) {
        const decodedToken = jwtDecode(token);

        if (expectedUserType && userType !== expectedUserType) {
            return <Navigate to="/" />;
        }
        return children;
    } else {
        // Token is expired or not present, redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        localStorage.removeItem("expirationTime");
        return <Navigate to="/" />;
    }
}

export default PrivateRoute;

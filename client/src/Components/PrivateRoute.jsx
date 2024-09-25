import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function PrivateRoute({ children, expectedUserType }) {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/" />;
    }

    try {
        const decodedToken = jwtDecode(token);

        if (Date.now() >= decodedToken.exp * 1000) {
            localStorage.clear();
            return <Navigate to="/" />;
        }

        const userType = decodedToken.userType;
        if (expectedUserType && userType !== expectedUserType) {
            return <Navigate to="/" />;
        }

        return children;
    } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.clear();
        return <Navigate to="/" />;
    }
}

export default PrivateRoute;

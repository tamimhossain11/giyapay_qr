import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Keeping your working import

function PrivateRoute({ children, expectedUserType }) {
    const token = localStorage.getItem('token');

    if (!token) {
        // No token present, redirect to login
        return <Navigate to="/" />;
    }

    try {
        const decodedToken = jwtDecode(token);

        // Check if the token is expired
        if (Date.now() >= decodedToken.exp * 1000) {
            // Token is expired, clear local storage and redirect to login
            localStorage.clear(); // Clears all related storage items
            return <Navigate to="/" />;
        }

        // Check if the user type matches the expected user type
        const userType = decodedToken.userType;
        if (expectedUserType && userType !== expectedUserType) {
            return <Navigate to="/" />;
        }

        return children;
    } catch (error) {
        console.error('Error decoding token:', error);
        // Invalid token, clear storage and redirect to login
        localStorage.clear();
        return <Navigate to="/" />;
    }
}

export default PrivateRoute;

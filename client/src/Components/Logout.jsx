import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        axios.post('http://localhost:3000/auth/logout', {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('userType');
            navigate('/');
        }).catch(err => {
            console.error('Logout failed:', err);
        });
    }, [navigate]);

    return null;
};

export default Logout;

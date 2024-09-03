import React, { useState } from 'react';
import axios from 'axios';

const AddAdmin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('http://localhost:3000/admin/add', {
                email,
                password
            });

            alert(response.data.message);
            setEmail('');
            setPassword('');
        } catch (error) {
            console.error('Error adding admin:', error);
            alert('Failed to add admin');
        }
    };

    return (
        <div>
            <h1>Add Admin</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                /><br />

                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                /><br />

                <button type="submit">Add Admin</button>
            </form>
        </div>
    );
};

export default AddAdmin;

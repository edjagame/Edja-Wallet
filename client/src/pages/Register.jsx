import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleRegister = async (e) => {
        e.preventDefault();
        console.log("Submitting:", { name, email, password });
        try {
            
            // Send details to server
            const response = await axios.post('/auth/register', { name, email, password });
            
            // Get token and user data from response
            const { token, user } = response.data;
            
            // Save token to localStorage
            localStorage.setItem('authToken', token);
            
            // Update AuthContext
            login(user);
            
            // Redirect user to Dashboard
            navigate('/');

            console.log("Registration successful:", response.data);
        } catch (err) {
            console.error("Registration failed:", err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        }
    };
    return (
        <div>
            <h1>Register</h1>
            {error && <p className="text-danger">{error}</p>}
            <form onSubmit={handleRegister}>
            <input type="name" value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
            <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default Register;
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {

            // Send details to server
            const response = await axios.post('/auth/login', { email, password });

            // Get token and user data from response
            const { token, user } = response.data;

            // Save token to localStorage
            localStorage.setItem('authToken', token);

            // Update AuthContext
            login(user);

            // Redirect user to Dashboard
            navigate('/');

        } catch (err) {
            console.error("Login failed:", err);
            // Extract error message sent from your backend (e.g. "Password or email is incorrect")
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        }
    };
    return (
        <div>
            <h1>Login</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
    );
}

export default Login;
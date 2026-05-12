import React, { useState, useContext } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

/**
 * Login Page
 * 
 * Handles user authentication via email and password.
 * Stores the returned JWT token and updates global AuthContext.
 */
function Login() {
    // --- State Management ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, login } = useContext(AuthContext);

    // Auth Guard: Redirect authenticated users to dashboard
    if (user) {
        return <Navigate to="/" />;
    }

    // --- Event Handlers ---
    // Submits credentials to the backend for verification
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Send login details to server
            const response = await axios.post('/auth/login', { email, password });

            // Extract session data
            const { token, user } = response.data;

            // Persist token for future requests
            localStorage.setItem('authToken', token);

            // Update application state
            login(user);

            // Redirect to home/dashboard
            navigate('/');

        } catch (err) {
            console.error("Login failed:", err);
            // Provide specific feedback if returned by API
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        }
    };

    // --- Rendering ---
    return (
        <div>
            <h1>Login</h1>
            {/* Display authentication errors */}
            {error && <p className="text-danger">{error}</p>}
            
            <form onSubmit={handleLogin}>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="Email" 
                  required 
                />
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Password" 
                  required 
                />
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
    );
}

export default Login;
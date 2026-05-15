import React, { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

/**
 * Register Page
 * 
 * Allows new users to create an account by providing name, email, and password.
 * Automatically logs in and redirects the user on successful registration.
 */
function Register() {
    // --- State Management ---
    const [name, setName] = useState('');
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
    // Submits new account details to the server
    const handleRegister = async (e) => {
        e.preventDefault();
        console.log("Register button clicked. Attempting registration...");
        console.log("Payload:", { name, email, password: password ? "***" : "missing" });
        
        try {
            console.log("Sending POST request to /auth/register...");
            // Create user account
            const response = await axios.post('/auth/register', { name, email, password });
            console.log("Server responded with success:", response.data);
            
            // Extract session data
            const { token, user } = response.data;
            console.log("Extracted token and user from response", { hasToken: !!token, user });
            
            // Persist token
            localStorage.setItem('authToken', token);
            console.log("Token stored in localStorage.");
            
            // Update AuthContext
            login(user);
            console.log("AuthContext login updated with user.");
            
            // Redirect to home page
            console.log("Redirecting to /");
            navigate('/');
        } catch (err) {
            console.error("Registration failed (catch block entered).", err);
            if (err.response) {
                console.error("Server responded with error status:", err.response.status);
                console.error("Error response data:", err.response.data);
            } else if (err.request) {
                console.error("No response received from server. Request object:", err.request);
            } else {
                console.error("Error setting up request:", err.message);
            }

            // Handle registration-specific errors from server
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
            <h1>Register</h1>
            {/* Validation/API error feedback */}
            {error && <p className="text-danger">{error}</p>}
            
            <form onSubmit={handleRegister}>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Name" 
                  required 
                />
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
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default Register;
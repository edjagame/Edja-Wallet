import React, { useState, useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

function ForgotPassword() {
    const { user } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    if (user) {
        return <Navigate to="/dashboard" />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const res = await axios.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div className="App">
            <div className="card" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
                <h1 style={{ textAlign: 'center' }}>Forgot Password</h1>
                <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                    Enter your email address and we'll send you a link to reset your password.
                </p>
                
                {message && <p className="text-success" style={{ textAlign: 'center' }}>{message}</p>}
                {error && <p className="text-danger" style={{ textAlign: 'center', color: 'red' }}>{error}</p>}
                
                {!message && (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="form-group">
                            <label>Email</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                        <button type="submit" style={{ width: '100%' }}>Send Reset Link</button>
                    </form>
                )}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Link to="/login" style={{ color: 'var(--color-primary)' }}>Back to Login</Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;

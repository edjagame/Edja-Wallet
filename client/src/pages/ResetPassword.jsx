import React, { useState, useContext } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { PASSWORD_MESSAGE, isStrongPassword } from '../utils/authValidation';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function ResetPassword() {
    const { user } = useContext(AuthContext);
    const query = useQuery();
    const token = query.get('token');
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    if (user) {
        return <Navigate to="/dashboard" />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (!isStrongPassword(newPassword)) {
            setError(PASSWORD_MESSAGE);
            return;
        }

        try {
            const res = await axios.post('/auth/reset-password', { token, newPassword });
            setMessage(res.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    if (!token) {
        return (
            <div className="App">
                <div className="card" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
                    <h1 style={{ color: 'red' }}>Invalid Token</h1>
                    <p>No reset token provided. Please request a new password reset link.</p>
                    <Link to="/forgot-password" style={{ color: 'var(--color-primary)', marginTop: '20px', display: 'inline-block' }}>
                        Go to Forgot Password
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="App">
            <div className="card" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
                <h1 style={{ textAlign: 'center' }}>Reset Password</h1>
                
                {message ? (
                    <div style={{ textAlign: 'center' }}>
                        <p className="text-success">{message}</p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '10px' }}>
                            Redirecting to login...
                        </p>
                    </div>
                ) : (
                    <>
                        {error && <p className="text-danger" style={{ textAlign: 'center', color: 'red' }}>{error}</p>}
                        
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="form-group">
                                <label>New Password</label>
                                <input 
                                    type="password" 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input 
                                    type="password" 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    required 
                                />
                            </div>
                            <button type="submit" style={{ width: '100%' }}>Reset Password</button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default ResetPassword;

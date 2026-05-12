import React, { useContext, useState } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Navigate } from 'react-router-dom';

/**
 * Settings Page
 * 
 * Provides user configuration tools.
 */
function Settings() {
    const { user } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    if (!user) {
        return <Navigate to="/login" />;
    }

    const restoreDefaultCategories = async () => {
        setMessage('');
        setError('');
        try {
            const res = await axios.post('/categories/restore-defaults');
            setMessage(res.data.message);
            setTimeout(() => setMessage(''), 5000);
        } catch (err) {
            console.error("Failed to restore default categories:", err);
            setError("Failed to restore categories.");
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        try {
            const res = await axios.post('/auth/change-password', {
                oldPassword,
                newPassword
            });
            setMessage(res.data.message);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setMessage(''), 5000);
        } catch (err) {
            console.error("Failed to change password:", err);
            setError(err.response?.data?.message || "Failed to change password.");
        }
    };

    return (
        <div className="App">
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
                <h1 style={{ textAlign: 'center' }}>Settings</h1>
                <p style={{ textAlign: 'center' }}>Manage your account preferences here.</p>

                {message && <p className="text-success" style={{ textAlign: 'center' }}>{message}</p>}
                {error && <p className="text-danger" style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

                <hr style={{ margin: '30px 0' }} />

                <section style={{ marginBottom: '30px' }}>
                    <h3>Categories configuration</h3>
                    <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '15px' }}>
                        If you've accidentally deleted some of your default categories or icons, you can restore them here. Custom categories won't be overwritten.
                    </p>
                    <button onClick={restoreDefaultCategories} style={{ width: '100%' }}>
                        Restore Default Categories
                    </button>
                </section>

                <hr style={{ margin: '30px 0' }} />

                <section style={{ marginBottom: '30px' }}>
                    <h3>Theme Settings</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '15px' }}>
                        Customize the appearance of your wallet.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button 
                            onClick={() => toggleTheme('dark')}
                            style={{ opacity: theme === 'dark' ? 1 : 0.6 }}
                            disabled={theme === 'dark'}
                        >
                            Switch to Dark Mode
                        </button>
                        <button 
                            onClick={() => toggleTheme('light')}
                            style={{ opacity: theme === 'light' ? 1 : 0.6 }}
                            disabled={theme === 'light'}
                        >
                            Switch to Light Mode
                        </button>
                    </div>
                </section>

                <hr style={{ margin: '30px 0' }} />

                <section>
                    <h3>Security</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '15px' }}>
                        Change your account password here.
                    </p>
                    <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="form-group">
                            <label>Current Password</label>
                            <input 
                                type="password" 
                                value={oldPassword} 
                                onChange={(e) => setOldPassword(e.target.value)} 
                                required
                            />
                        </div>
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
                        <button type="submit" className="btn-danger" style={{ width: '100%' }}>
                            Change Password
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}

export default Settings;
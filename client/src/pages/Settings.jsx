import React, { useContext, useState } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

/**
 * Settings Page
 * 
 * Provides user configuration tools.
 */
function Settings() {
    const { user } = useContext(AuthContext);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

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

                <section style={{ marginBottom: '30px', opacity: 0.6 }}>
                    <h3>Theme Settings (Coming Soon)</h3>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button disabled>Switch to Dark Mode</button>
                        <button disabled>Switch to Light Mode</button>
                    </div>
                </section>

                <hr style={{ margin: '30px 0' }} />

                <section style={{ opacity: 0.6 }}>
                    <h3>Security (Coming Soon)</h3>
                    <button className="btn-danger" disabled style={{ width: '100%' }}>Change Password</button>
                </section>
            </div>
        </div>
    );
}

export default Settings;
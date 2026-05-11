import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  // If the user isn't logged in, redirect them to the login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="App">
      <div className="card">
        <h1>Dashboard</h1>
        <p>Welcome back, {user.name || 'User'}!</p>
        <button onClick={logout}>Log Out</button>
      </div>
    </div>
  );
}

export default Dashboard;

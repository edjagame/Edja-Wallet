import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './navbar.css';

/**
 * LoggedInNavbar Component
 * 
 * Provides navigation links and user-specific actions (like Logout) 
 * for authenticated users.
 */
function LoggedInNavbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    logout();
    navigate('/login');
  };

  const handleDashboardClick = () => {
    navigate('/');
  };

  const handleTransactionsClick = () => {
    navigate('/transactions');
  };

  const handleCategoriesClick = () => {
    navigate('/categories');
  };

  const handleBudgetsClick = () => {
    navigate('/budgets');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src={`${process.env.PUBLIC_URL}/edja-wallet-icon.svg`} alt="Edja Wallet Logo" className="navbar-logo" />
        <h2 className="navbar-title">Edja Wallet</h2>
      </div>
      <ul className="navbar-list">
        <li><button onClick={handleDashboardClick} className="nav-button">Dashboard</button></li>
        <li><button onClick={handleTransactionsClick} className="nav-button">Transactions</button></li>
        <li><button onClick={handleBudgetsClick} className="nav-button">Budgets</button></li>
        <li><button onClick={handleCategoriesClick} className="nav-button">Categories</button></li>
        <li><button onClick={handleSettingsClick} className="nav-button">Settings</button></li>
        <li><span className="user-greeting">Hello, {user.name}!</span></li>
        <li><button onClick={handleLogout} className="nav-button-logout">Logout</button></li>
      </ul>
    </nav>
  );
}

export default LoggedInNavbar;

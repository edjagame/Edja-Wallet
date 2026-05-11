import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './navbar.css';

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
  }

  const handleTransactionsClick = () => {
    navigate('/transactions');
  }

  const handleCategoriesClick = () => {
    navigate('/categories');
  }

  return (
    <nav className="navbar">
      <h2 className="navbar-title">Edja Wallet</h2>
      <ul className="navbar-list">
        <li><button onClick={handleDashboardClick} className="nav-button">Dashboard</button></li>
        <li><button onClick={handleTransactionsClick} className="nav-button">Transactions</button></li>
        <li><button onClick={handleCategoriesClick} className="nav-button">Categories</button></li>
        <li><span className="user-greeting">Hello, {user.name}!</span></li>
        <li><button onClick={handleLogout} className="nav-button-logout">Logout</button></li>
      </ul>
    </nav>
  );
}

export default LoggedInNavbar;

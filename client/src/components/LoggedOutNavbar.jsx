import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './navbar.css';

function LoggedOutNavbar() {
    const navigate = useNavigate();

    const handleDashboardClick = () => {
        navigate('/');
    }

    const handleLoginClick = () => {
        navigate('/login');
    }

    const handleRegisterClick = () => {
        navigate('/register');
    }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src={`${process.env.PUBLIC_URL}/edja-wallet-icon.svg`} alt="Edja Wallet Logo" className="navbar-logo" />
        <h2 className="navbar-title">Edja Wallet</h2>
      </div>
      <ul className="navbar-list">  
        <li><button onClick={handleLoginClick} className="nav-button">Login</button></li>
        <li><button onClick={handleRegisterClick} className="nav-button primary-action">Register</button></li>
      </ul>
    </nav>
  );
}

export default LoggedOutNavbar;

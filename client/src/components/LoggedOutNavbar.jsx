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
      <h2 className="navbar-title">Edja Wallet</h2>
      <ul className="navbar-list">  
        <li><button onClick={handleLoginClick} className="nav-button">Login</button></li>
        <li><button onClick={handleRegisterClick} className="nav-button primary-action">Register</button></li>
      </ul>
    </nav>
  );
}

export default LoggedOutNavbar;

import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav style={{ textAlign: 'center' }}>
      <h2>Edja Wallet</h2>
      <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', justifyItems: 'center', justifyContent: 'center', gap: '20px' }}>
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/transactions">Transactions</Link></li>
        <li><Link to="/login">Login</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;

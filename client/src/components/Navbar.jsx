import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import LoggedInNavbar from './LoggedInNavbar';
import LoggedOutNavbar from './LoggedOutNavbar';

/**
 * Navbar Component (Controller)
 * 
 * Determines which navigation bar to display based on the 
 * user's authentication status.
 */
function Navbar() {
  const { user } = useContext(AuthContext);

  // Toggle between LoggedIn and LoggedOut views
  return user ? <LoggedInNavbar /> : <LoggedOutNavbar />;
}

export default Navbar;

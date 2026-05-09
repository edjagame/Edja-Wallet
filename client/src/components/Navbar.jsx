import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import LoggedInNavbar from './LoggedInNavbar';
import LoggedOutNavbar from './LoggedOutNavbar';

function Navbar() {
  const { user } = useContext(AuthContext);

  return user ? <LoggedInNavbar /> : <LoggedOutNavbar />;
}

export default Navbar;

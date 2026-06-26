import React, { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import {
  EMAIL_MESSAGE,
  PASSWORD_MESSAGE,
  normalizeName,
  normalizeEmail,
  isValidEmail,
  isStrongPassword
} from '../utils/authValidation';

/**
 * Register Page
 * 
 * Allows new users to create an account by providing name, email, and password.
 * Automatically logs in and redirects the user on successful registration.
 */
function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);

  if (user) {
    return <Navigate to="/" />;
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    const normalizedName = normalizeName(name);
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedName || !normalizedEmail || !password) {
      setError('Name, email, and password are required');
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError(EMAIL_MESSAGE);
      return;
    }

    if (!isStrongPassword(password)) {
      setError(PASSWORD_MESSAGE);
      return;
    }

    try {
      const response = await axios.post('/auth/register', {
        name: normalizedName,
        email: normalizedEmail,
        password
      });
      const { token, user } = response.data;

      localStorage.setItem('authToken', token);
      login(user);
      navigate('/');
    } catch (err) {
      console.error('Registration failed:', err);

      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div>
      <h1>Register</h1>
      {error && <p className="text-danger">{error}</p>}

      <form onSubmit={handleRegister} noValidate>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;

const PASSWORD_MESSAGE = 'Password must be at least 8 characters and include at least one letter and one number';
const EMAIL_MESSAGE = 'Enter a valid email address';

// Keep client and server validation rules aligned for auth-related forms.
const normalizeName = (name) => (typeof name === 'string' ? name.trim() : '');

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '');

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStrongPassword = (password) => (
  typeof password === 'string'
  && password.length >= 8
  && /[A-Za-z]/.test(password)
  && /\d/.test(password)
);

module.exports = {
  EMAIL_MESSAGE,
  PASSWORD_MESSAGE,
  normalizeName,
  normalizeEmail,
  isValidEmail,
  isStrongPassword
};

export const PASSWORD_MESSAGE = 'Password must be at least 8 characters and include at least one letter and one number';
export const EMAIL_MESSAGE = 'Enter a valid email address';

export const normalizeName = (name) => (typeof name === 'string' ? name.trim() : '');

export const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '');

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isStrongPassword = (password) => (
  typeof password === 'string'
  && password.length >= 8
  && /[A-Za-z]/.test(password)
  && /\d/.test(password)
);

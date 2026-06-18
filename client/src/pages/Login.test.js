import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Login from './Login';

const mockNavigate = jest.fn();

jest.mock('../api/axios', () => ({
  post: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

function renderLogin(login = jest.fn()) {
  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user: null, login }}>
        <Login />
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

test('submits credentials, stores the token, logs in, and navigates home', async () => {
  const login = jest.fn();
  axios.post.mockResolvedValueOnce({
    data: {
      token: 'jwt-token',
      user: { id: 1, name: 'Edja', email: 'edja@example.com' }
    }
  });

  renderLogin(login);

  userEvent.type(screen.getByPlaceholderText(/email/i), 'edja@example.com');
  userEvent.type(screen.getByPlaceholderText(/password/i), 'password123');
  userEvent.click(screen.getByRole('button', { name: /login/i }));

  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith('/auth/login', {
      email: 'edja@example.com',
      password: 'password123'
    });
  });
  expect(localStorage.getItem('authToken')).toBe('jwt-token');
  expect(login).toHaveBeenCalledWith({ id: 1, name: 'Edja', email: 'edja@example.com' });
  expect(mockNavigate).toHaveBeenCalledWith('/');
});

test('shows API error messages', async () => {
  axios.post.mockRejectedValueOnce({
    response: { data: { message: 'Invalid credentials' } }
  });
  jest.spyOn(console, 'error').mockImplementation(() => {});

  renderLogin();

  userEvent.type(screen.getByPlaceholderText(/email/i), 'edja@example.com');
  userEvent.type(screen.getByPlaceholderText(/password/i), 'wrong-password');
  userEvent.click(screen.getByRole('button', { name: /login/i }));

  expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  expect(mockNavigate).not.toHaveBeenCalled();

  console.error.mockRestore();
});

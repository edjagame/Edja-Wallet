import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Register from './Register';

const mockNavigate = jest.fn();

jest.mock('../api/axios', () => ({
  post: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

function renderRegister(login = jest.fn()) {
  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user: null, login }}>
        <Register />
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

test('blocks weak password without calling the API', async () => {
  renderRegister();

  userEvent.type(screen.getByPlaceholderText(/name/i), 'Edja');
  userEvent.type(screen.getByPlaceholderText(/email/i), 'edja@example.com');
  userEvent.type(screen.getByPlaceholderText(/password/i), 'password');
  userEvent.click(screen.getByRole('button', { name: /register/i }));

  expect(await screen.findByText('Password must be at least 8 characters and include at least one letter and one number')).toBeInTheDocument();
  expect(axios.post).not.toHaveBeenCalled();
});

test('submits trimmed name and lowercase email for valid input', async () => {
  const login = jest.fn();
  axios.post.mockResolvedValueOnce({
    data: {
      token: 'jwt-token',
      user: { id: 1, name: 'Edja', email: 'edja@example.com' }
    }
  });

  renderRegister(login);

  userEvent.type(screen.getByPlaceholderText(/name/i), '  Edja  ');
  userEvent.type(screen.getByPlaceholderText(/email/i), '  Edja@Example.COM  ');
  userEvent.type(screen.getByPlaceholderText(/password/i), 'password1');
  userEvent.click(screen.getByRole('button', { name: /register/i }));

  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith('/auth/register', {
      name: 'Edja',
      email: 'edja@example.com',
      password: 'password1'
    });
  });
  expect(localStorage.getItem('authToken')).toBe('jwt-token');
  expect(login).toHaveBeenCalledWith({ id: 1, name: 'Edja', email: 'edja@example.com' });
  expect(mockNavigate).toHaveBeenCalledWith('/');
});

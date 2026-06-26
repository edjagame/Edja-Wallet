import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import ResetPassword from './ResetPassword';

jest.mock('../api/axios', () => ({
  post: jest.fn()
}));

function renderResetPassword() {
  return render(
    <MemoryRouter initialEntries={['/reset-password?token=reset-token']}>
      <AuthContext.Provider value={{ user: null }}>
        <ResetPassword />
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

test('blocks weak new password without calling the API', async () => {
  const { container } = renderResetPassword();
  const passwordInputs = container.querySelectorAll('input[type="password"]');

  userEvent.type(passwordInputs[0], 'password');
  userEvent.type(passwordInputs[1], 'password');
  userEvent.click(screen.getByRole('button', { name: /reset password/i }));

  expect(await screen.findByText('Password must be at least 8 characters and include at least one letter and one number')).toBeInTheDocument();
  expect(axios.post).not.toHaveBeenCalled();
});

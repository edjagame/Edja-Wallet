import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import Settings from './Settings';

jest.mock('../api/axios', () => ({
  post: jest.fn()
}));

function renderSettings() {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user: { id: 1, name: 'Edja' } }}>
        <ThemeContext.Provider value={{ theme: 'light', toggleTheme: jest.fn() }}>
          <Settings />
        </ThemeContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

test('blocks weak new password without calling the API', async () => {
  const { container } = renderSettings();
  const passwordInputs = container.querySelectorAll('input[type="password"]');

  userEvent.type(passwordInputs[0], 'oldpassword1');
  userEvent.type(passwordInputs[1], 'password');
  userEvent.type(passwordInputs[2], 'password');
  userEvent.click(screen.getByRole('button', { name: /change password/i }));

  expect(await screen.findByText('Password must be at least 8 characters and include at least one letter and one number')).toBeInTheDocument();
  expect(axios.post).not.toHaveBeenCalled();
});

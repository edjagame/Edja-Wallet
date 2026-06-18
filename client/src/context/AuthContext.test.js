import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthContext, AuthProvider } from './AuthContext';

function AuthConsumer() {
  return (
    <AuthContext.Consumer>
      {({ user, login, logout }) => (
        <div>
          <span data-testid="user-name">{user ? user.name : 'Guest'}</span>
          <button onClick={() => login({ id: 1, name: 'Edja' })}>Log In</button>
          <button onClick={logout}>Log Out</button>
        </div>
      )}
    </AuthContext.Consumer>
  );
}

beforeEach(() => {
  localStorage.clear();
});

test('initializes the user from localStorage', async () => {
  localStorage.setItem('user', JSON.stringify({ id: 7, name: 'Stored User' }));

  render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );

  expect(await screen.findByTestId('user-name')).toHaveTextContent('Stored User');
});

test('login persists user data', async () => {
  render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );

  await screen.findByText('Guest');
  userEvent.click(screen.getByRole('button', { name: /log in/i }));

  await waitFor(() => {
    expect(screen.getByTestId('user-name')).toHaveTextContent('Edja');
  });
  expect(localStorage.getItem('user')).toBe(JSON.stringify({ id: 1, name: 'Edja' }));
});

test('logout clears user and auth token', async () => {
  localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Edja' }));
  localStorage.setItem('authToken', 'token-123');

  render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );

  expect(await screen.findByTestId('user-name')).toHaveTextContent('Edja');
  userEvent.click(screen.getByRole('button', { name: /log out/i }));

  await waitFor(() => {
    expect(screen.getByTestId('user-name')).toHaveTextContent('Guest');
  });
  expect(localStorage.getItem('user')).toBeNull();
  expect(localStorage.getItem('authToken')).toBeNull();
});

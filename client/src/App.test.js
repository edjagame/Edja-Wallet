import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import axios from './api/axios';

jest.mock('./api/axios', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

beforeEach(() => {
  localStorage.clear();
  axios.get.mockResolvedValue({ data: [] });
});

test('renders the app shell', async () => {
  render(<App />);

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from '../api/axios';
import BudgetForm from './BudgetForm';

jest.mock('../api/axios', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

beforeEach(() => {
  jest.clearAllMocks();
  window.alert = jest.fn();
  axios.get.mockResolvedValue({
    data: [
      { id: 1, name: 'Groceries', type: 'expense' },
      { id: 2, name: 'Rent', type: 'expense' }
    ]
  });
});

test('loads categories and posts normalized budget data', async () => {
  axios.post.mockResolvedValueOnce({ data: { id: 10 } });

  render(<BudgetForm />);

  await screen.findByRole('option', { name: /groceries/i });
  const selects = screen.getAllByRole('combobox');
  const categorySelect = selects[0];
  const monthSelect = selects[1];

  userEvent.selectOptions(categorySelect, '1');
  userEvent.type(screen.getByPlaceholderText(/monthly limit/i), '500');
  userEvent.selectOptions(monthSelect, '3');
  const yearInput = screen.getByDisplayValue(new Date().getFullYear().toString());
  userEvent.clear(yearInput);
  userEvent.type(yearInput, '2026');
  userEvent.click(screen.getByRole('button', { name: /add budget/i }));

  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith('/budgets', {
      category_id: '1',
      monthly_limit: '500',
      month: '2026-03-01'
    });
  });
  expect(window.alert).toHaveBeenCalledWith('Budget created successfully');
});

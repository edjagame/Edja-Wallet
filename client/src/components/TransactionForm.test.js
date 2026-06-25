import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from '../api/axios';
import TransactionForm from './TransactionForm';

jest.mock('../api/axios', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

const categories = [
  { id: 1, name: 'Other', type: 'expense', icon: '*' },
  { id: 2, name: 'Groceries', type: 'expense', icon: '$' },
  { id: 3, name: 'Other', type: 'income', icon: '+' },
  { id: 4, name: 'Salary', type: 'income', icon: '+' }
];

beforeEach(() => {
  jest.clearAllMocks();
  axios.get.mockResolvedValue({ data: categories });
});

test('loads and filters category options by transaction type', async () => {
  render(<TransactionForm />);

  const categorySelect = screen.getByRole('combobox');
  await within(categorySelect).findByRole('option', { name: /groceries/i });
  expect(within(categorySelect).getByRole('option', { name: /groceries/i })).toBeInTheDocument();
  expect(within(categorySelect).queryByRole('option', { name: /salary/i })).not.toBeInTheDocument();

  userEvent.click(screen.getByRole('button', { name: /^income$/i }));

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /add new income/i })).toBeInTheDocument();
  });
  expect(within(categorySelect).getByRole('option', { name: /salary/i })).toBeInTheDocument();
  expect(within(categorySelect).queryByRole('option', { name: /groceries/i })).not.toBeInTheDocument();
});

test('posts selected transaction data, resets fields, and calls onTransactionAdded', async () => {
  const onTransactionAdded = jest.fn();
  const createdTransaction = { id: 99, description: 'Market run', amount: '42.50' };
  axios.post.mockResolvedValueOnce({ data: createdTransaction });

  render(<TransactionForm onTransactionAdded={onTransactionAdded} />);

  const categorySelect = screen.getByRole('combobox');
  await within(categorySelect).findByRole('option', { name: /groceries/i });
  userEvent.type(screen.getByPlaceholderText(/description/i), 'Market run');
  userEvent.type(screen.getByPlaceholderText(/amount/i), '42.50');
  fireEvent.change(screen.getByLabelText(/transaction date and time/i), {
    target: { value: '2026-06-15T09:30' }
  });
  userEvent.selectOptions(categorySelect, '2');
  userEvent.click(screen.getByRole('button', { name: /add expense/i }));

  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith('/transactions', {
      amount: '42.50',
      description: 'Market run',
      categoryId: '2',
      occurredAt: '2026-06-15T09:30'
    });
  });
  expect(onTransactionAdded).toHaveBeenCalledWith(createdTransaction);
  expect(screen.getByText('Transaction added successfully!')).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/description/i)).toHaveValue('');
  expect(screen.getByPlaceholderText(/amount/i)).toHaveValue(null);
});

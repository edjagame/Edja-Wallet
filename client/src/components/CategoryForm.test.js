import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from '../api/axios';
import CategoryForm from './CategoryForm';

jest.mock('../api/axios', () => ({
  post: jest.fn()
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test('posts category data, resets fields, and calls onCategoryAdded', async () => {
  const onCategoryAdded = jest.fn();
  const createdCategory = { id: 1, name: 'Groceries', type: 'expense', icon: '$' };
  axios.post.mockResolvedValueOnce({ data: createdCategory });

  render(<CategoryForm onCategoryAdded={onCategoryAdded} />);

  userEvent.type(screen.getByPlaceholderText(/category name/i), 'Groceries');
  userEvent.selectOptions(screen.getByRole('combobox'), 'expense');
  userEvent.type(screen.getByPlaceholderText(/icon/i), '$');
  userEvent.click(screen.getByRole('button', { name: /add category/i }));

  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith('/categories', {
      name: 'Groceries',
      type: 'expense',
      icon: '$'
    });
  });
  expect(await screen.findByText('Category created successfully!')).toBeInTheDocument();
  expect(onCategoryAdded).toHaveBeenCalledWith(createdCategory);
  expect(screen.getByPlaceholderText(/category name/i)).toHaveValue('');
  expect(screen.getByPlaceholderText(/icon/i)).toHaveValue('');
  expect(screen.getByRole('combobox')).toHaveValue('expense');
});

test('displays backend validation errors', async () => {
  axios.post.mockRejectedValueOnce({
    response: { data: { message: 'Category already exists' } }
  });
  jest.spyOn(console, 'error').mockImplementation(() => {});

  render(<CategoryForm />);

  userEvent.type(screen.getByPlaceholderText(/category name/i), 'Groceries');
  userEvent.click(screen.getByRole('button', { name: /add category/i }));

  expect(await screen.findByText('Category already exists')).toBeInTheDocument();

  console.error.mockRestore();
});

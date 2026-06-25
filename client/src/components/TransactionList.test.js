import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionList from './TransactionList';

const transactions = [
  {
    id: 10,
    description: 'Market run',
    amount: '42.50',
    category_id: 2,
    category_name: 'Groceries',
    category_icon: '$',
    category_type: 'expense',
    occurred_at: '2026-06-15T09:30:00.000Z',
    created_at: '2026-06-14T08:00:00.000Z'
  }
];

const categories = [
  { id: 2, name: 'Groceries', type: 'expense', icon: '$' },
  { id: 3, name: 'Salary', type: 'income', icon: '+' }
];

test('saves inline edits with occurredAt instead of createdAt', async () => {
  const onSaveEdit = jest.fn().mockResolvedValue();

  render(
    <TransactionList
      transactions={transactions}
      selectedTransactionId={null}
      onSelectTransaction={jest.fn()}
      onSaveEdit={onSaveEdit}
      categories={categories}
    />
  );

  userEvent.dblClick(screen.getByText('Market run').closest('tr'));
  fireEvent.change(screen.getByLabelText(/transaction date and time/i), {
    target: { value: '2026-06-16T10:45' }
  });
  userEvent.click(screen.getByTitle('Save'));

  await waitFor(() => {
    expect(onSaveEdit).toHaveBeenCalledWith(
      10,
      expect.objectContaining({
        amount: '42.50',
        categoryId: 2,
        description: 'Market run',
        occurredAt: '2026-06-16T10:45'
      })
    );
  });
});

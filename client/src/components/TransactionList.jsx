import React, { useState } from 'react';

/**
 * Displays transactions in a selectable table with inline edit support.
 */
function TransactionList({
  transactions,
  selectedTransactionId,
  onSelectTransaction,
  onSaveEdit,
  categories = [],
}) {
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({
    description: '',
    amount: '',
    categoryId: '',
    occurredAt: ''
  });

  const formatForInput = (dateStr) => {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const startEdit = (transaction) => {
    setEditingId(transaction.id);
    setEditDraft({
      description: transaction.description,
      amount: transaction.amount,
      categoryId: transaction.category_id ?? '',
      occurredAt: formatForInput(transaction.occurred_at || transaction.created_at),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({ description: '', amount: '', categoryId: '', occurredAt: '' });
  };

  const saveEdit = async (id) => {
    await onSaveEdit(id, editDraft);
    setEditingId(null);
  };

  const updateDraft = (field, value) => {
    setEditDraft((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="transaction-list card">
      <h3 className="mt-0 mb-20">Transaction History</h3>

      {transactions && transactions.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Date Time</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th className="w-90"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const isSelected = transaction.id === selectedTransactionId;
              const isEditing = transaction.id === editingId;

              return (
                <tr
                  key={transaction.id}
                  onClick={() => {
                    if (!isEditing) {
                      onSelectTransaction(isSelected ? null : transaction.id);
                    }
                  }}
                  onDoubleClick={() => {
                    if (!isEditing) startEdit(transaction);
                  }}
                  className={`tr-row ${isEditing ? 'editing' : isSelected ? 'selected' : ''}`}
                >
                  <td className="p-10 nowrap">
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        aria-label="Transaction date and time"
                        value={editDraft.occurredAt}
                        onChange={(e) => updateDraft('occurredAt', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="p-4"
                      />
                    ) : (
                      new Date(transaction.occurred_at || transaction.created_at).toLocaleString()
                    )}
                  </td>

                  <td className="p-10">
                    {isEditing ? (
                      <select
                        value={editDraft.categoryId}
                        onChange={(e) => updateDraft('categoryId', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-100p p-4"
                      >
                        <option value="">-- No Category --</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      `${transaction.category_icon ?? ''} ${transaction.category_name || 'Uncategorized'}`.trim()
                    )}
                  </td>

                  <td className="p-10">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editDraft.description}
                        onChange={(e) => updateDraft('description', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-100p p-4"
                      />
                    ) : (
                      transaction.description
                    )}
                  </td>

                  <td className="amount p-10">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editDraft.amount}
                        onChange={(e) => updateDraft('amount', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-100p p-4"
                        min="0"
                      />
                    ) : (
                      <span title={transaction.category_type === 'income' ? 'Income' : 'Expense'}>
                        {transaction.category_type === 'income' ? '+' : '-'} {Number(transaction.amount).toFixed(2)}
                      </span>
                    )}
                  </td>

                  <td className="p-10">
                    {isEditing && (
                      <span className="d-flex gap-6">
                        <button
                          title="Save"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveEdit(transaction.id);
                          }}
                          className="btn-icon-success"
                        >
                          ✓
                        </button>
                        <button
                          title="Cancel"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEdit();
                          }}
                          className="btn-icon-cancel"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No transactions found. Start by adding one above!</p>
      )}
    </div>
  );
}

export default TransactionList;

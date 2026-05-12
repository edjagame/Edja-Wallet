import React, { useState } from 'react';

/**
 * TransactionList Component
 *
 * Displays a list of financial transactions in a table.
 * - Single-click a row to select it (for deletion).
 * - Double-click a row to enter inline edit mode.
 * - Save / Cancel buttons appear only while a row is being edited.
 *
 * @param {Array}    transactions         - List of transaction objects to display
 * @param {string|number} selectedTransactionId - ID of the currently selected row
 * @param {Function} onSelectTransaction  - Called with the row's ID (or null) on single-click
 * @param {Function} onSaveEdit           - Called with (id, { amount, description, categoryId, createdAt }) on save
 * @param {Array}    categories           - List of { id, name, icon } objects for the category dropdown
 */
function TransactionList({
  transactions,
  selectedTransactionId,
  onSelectTransaction,
  onSaveEdit,
  categories = [],
}) {
  // ID of the row currently being edited, or null
  const [editingId, setEditingId] = useState(null);
  // Working copy of the editable fields while in edit mode
  const [editDraft, setEditDraft] = useState({ description: '', amount: '', categoryId: '', createdAt: '' });

  // --- Helpers ---

  /** Format a date string/object to YYYY-MM-DDTHH:mm for datetime-local input */
  const formatForInput = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    // Adjust for timezone offset to get local time string
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
    return localISOTime;
  };

  /** Enter edit mode for a given transaction */
  const startEdit = (t) => {
    setEditingId(t.id);
    setEditDraft({
      description: t.description,
      amount: t.amount,
      categoryId: t.category_id ?? '',
      createdAt: formatForInput(t.created_at),
    });
  };

  /** Abort edit without saving */
  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({ description: '', amount: '', categoryId: '', createdAt: '' });
  };

  /** Persist changes to the parent */
  const saveEdit = async (id) => {
    await onSaveEdit(id, editDraft);
    setEditingId(null);
  };

  /** Update a single field in the draft */
  const updateDraft = (field, value) => {
    setEditDraft((prev) => ({ ...prev, [field]: value }));
  };

  // --- Rendering ---
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
              {/* Extra column header for the action buttons */}
              <th className="w-90"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => {
              const isSelected = t.id === selectedTransactionId;
              const isEditing = t.id === editingId;

              return (
                <tr
                  key={t.id}
                  // Single-click selects the row (only when not in edit mode)
                  onClick={() => {
                    if (!isEditing) {
                      onSelectTransaction(isSelected ? null : t.id);
                    }
                  }}
                  // Double-click enters edit mode
                  onDoubleClick={() => {
                    if (!isEditing) startEdit(t);
                  }}
                  className={`tr-row ${isEditing ? 'editing' : isSelected ? 'selected' : ''}`}
                >
                  {/* Date Time */}
                  <td className="p-10 nowrap">
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={editDraft.createdAt}
                        onChange={(e) => updateDraft('createdAt', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="p-4"
                      />
                    ) : (
                      new Date(t.created_at).toLocaleString()
                    )}
                  </td>

                  {/* Category */}
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
                      `${t.category_icon ?? ''} ${t.category_name || 'Uncategorized'}`.trim()
                    )}
                  </td>

                  {/* Description */}
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
                      t.description
                    )}
                  </td>

                  {/* Amount */}
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
                      <span title={t.category_type === 'income' ? 'Income' : 'Expense'}>
                        {t.category_type === 'income' ? '+' : '−'} {Number(t.amount).toFixed(2)}
                      </span>
                    )}
                  </td>

                  {/* Save / Cancel — only visible in edit mode */}
                  <td className="p-10">
                    {isEditing && (
                      <span className="d-flex gap-6">
                        <button
                          title="Save"
                          onClick={(e) => { e.stopPropagation(); saveEdit(t.id); }}
                          className="btn-icon-success"
                        >
                          ✓
                        </button>
                        <button
                          title="Cancel"
                          onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                          className="btn-icon-cancel"
                        >
                          ✗
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

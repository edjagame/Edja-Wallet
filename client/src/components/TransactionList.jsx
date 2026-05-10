import React from 'react';

/**
 * TransactionList Component
 * 
 * Displays a list of financial transactions in a table.
 * If no transactions are found, it displays a friendly fallback message.
 * 
 * @param {Array} transactions - List of transaction objects to display
 * @param {string|number} selectedTransactionId - The ID of the currently selected transaction
 * @param {Function} onSelectTransaction - Function to call when a transaction row is clicked
 */
function TransactionList({ transactions, selectedTransactionId, onSelectTransaction }) {
  return (
    <div className="transaction-list">
      <h3>Transaction History</h3>

      {transactions && transactions.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px' }}>Date</th>
              <th style={{ padding: '10px' }}>Category</th>
              <th style={{ padding: '10px' }}>Description</th>
              <th style={{ padding: '10px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => {
              const isSelected = t.id === selectedTransactionId;
              return (
                <tr
                  key={t.id}
                  onClick={() => onSelectTransaction(isSelected ? null : t.id)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <td style={{ padding: '10px' }}>{new Date(t.created_at).toLocaleString()}</td>
                  <td style={{ padding: '10px' }}>{t.category_icon} {t.category_name || 'Uncategorized'}</td>
                  <td style={{ padding: '10px' }}>{t.description}</td>
                  <td style={{ padding: '10px' }}>{t.amount}</td>
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

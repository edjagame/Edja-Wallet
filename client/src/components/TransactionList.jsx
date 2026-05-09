import React from 'react';

// TODO 1: Accept props, e.g., function TransactionList({ transactions })
function TransactionList() {
  return (
    <div>
      <h3>Transaction History</h3>
      {/* TODO 2: Check if transactions exist and are not empty */}
      
      {/* TODO 3: Map over the transactions array and render them */}
      {/* Example:
          <ul>
            {transactions.map((t) => (
              <li key={t.id}>{t.description} - ${t.amount}</li>
            ))}
          </ul>
      */}
      
      {/* Temporary placeholder so the component isn't completely empty */}
      <p>Your transactions will appear here...</p>
    </div>
  );
}

export default TransactionList;

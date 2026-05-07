import React from 'react';

function TransactionForm() {
  return (
    <div>
      <h3>Add New Transaction</h3>
      <form>
        <input type="text" placeholder="Description" />
        <input type="number" placeholder="Amount" />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export default TransactionForm;

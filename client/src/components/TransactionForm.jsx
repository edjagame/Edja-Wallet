import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const formatForDateTimeInput = (date = new Date()) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

/**
 * Adds a new income or expense transaction using the user's categories.
 */
function TransactionForm({ onTransactionAdded }) {
  const [transactionType, setTransactionType] = useState('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [occurredAt, setOccurredAt] = useState(formatForDateTimeInput);
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Select the matching "Other" category as a safe default for each type.
  useEffect(() => {
    const defaultOther = categories.find(
      (cat) => cat.name.toLowerCase() === 'other' && cat.type === transactionType
    );

    if (defaultOther) {
      setCategoryId(defaultOther.id);
    } else {
      setCategoryId('');
    }
  }, [transactionType, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryId) {
      console.warn('Please select a category!');
      return;
    }

    try {
      const res = await axios.post('/transactions', { amount, description, categoryId, occurredAt });

      setDescription('');
      setAmount('');
      setOccurredAt(formatForDateTimeInput());
      setCategoryId('');

      setSuccessMessage('Transaction added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      if (onTransactionAdded) {
        onTransactionAdded(res.data);
      }
    } catch (err) {
      console.error('Failed to add transaction:', err);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === transactionType);

  return (
    <div className="transaction-form">
      <h3>Add New {transactionType === 'expense' ? 'Expense' : 'Income'}</h3>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button
          type="button"
          onClick={() => setTransactionType('expense')}
          style={{
            flex: 1,
            backgroundColor: transactionType === 'expense' ? '#3B82F6' : '#e5e7eb',
            color: transactionType === 'expense' ? 'white' : 'black'
          }}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setTransactionType('income')}
          style={{
            flex: 1,
            backgroundColor: transactionType === 'income' ? '#10B981' : '#e5e7eb',
            color: transactionType === 'income' ? 'white' : 'black'
          }}
        >
          Income
        </button>
      </div>

      {successMessage && <p className="text-success">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        {/* Description Input */}
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="0.01"
          required
        />

        <input
          type="datetime-local"
          aria-label="Transaction date and time"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          required
        />

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">-- Select Category --</option>
          {filteredCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>

        <button type="submit">Add {transactionType === 'expense' ? 'Expense' : 'Income'}</button>
      </form>
    </div>
  );
}

export default TransactionForm;

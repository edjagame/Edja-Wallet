import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

/**
 * TransactionForm Component
 * 
 * Provides a form for users to add new financial transactions.
 * Fetches dynamic categories from the backend and handles form submission.
 */
function TransactionForm({ onTransactionAdded }) {
  // --- State Management ---
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  // --- Effects ---
  // Fetches the list of available categories from the database on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // --- Event Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation to ensure a category is selected
    if (!categoryId) {
      // Could also use a state for error messages here if you want!
      console.warn("Please select a category!");
      return;
    }

    try {
      // Send transaction data to the backend
      const res = await axios.post('/transactions', { amount, description, categoryId });
      
      // Reset form state on successful submission
      setDescription('');
      setAmount('');
      setCategoryId('');
      
      // Show success message and clear it after 3 seconds
      setSuccessMessage('Transaction added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Call the parent component's function to update the list immediately
      if (onTransactionAdded) {
        onTransactionAdded(res.data);
      }
    } catch (err) {
      console.error("Failed to add transaction:", err);
    }
  };

  // --- Rendering ---
  return (
    <div className="transaction-form">
      <h3>Add New Transaction</h3>
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        {/* Description Input */}
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        
        {/* Amount Input */}
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        {/* Dynamic Category Dropdown */}
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">-- Select Category --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>

        <button type="submit">Add Transaction</button>
      </form>
    </div>
  );
}

export default TransactionForm;

import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';

/**
 * Transactions Page
 *
 * Main container for managing the user's transactions.
 * Handles fetching, searching, adding, editing, and deleting transactions.
 */
function Transactions() {
  // --- State Management ---
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

  // --- Data Fetching ---

  // Fetches transactions from the backend, optionally filtered by a search query
  const fetchTransactions = async (query = '') => {
    try {
      const res = await axios.get(`/transactions?search=${query}`);
      setTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  // Fetches the available categories (shared with TransactionForm and the inline edit dropdown)
  const fetchCategories = async () => {
    try {
      const res = await axios.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Load transactions and categories once when the page first mounts
  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  // --- Event Handlers ---

  // Triggers a new fetch request when the search form is submitted
  const handleSearch = (e) => {
    e.preventDefault();
    fetchTransactions(searchQuery);
  };

  // Deletes the currently selected transaction
  const handleDelete = async () => {
    if (!selectedTransactionId) return;

    const isConfirmed = window.confirm('Are you sure you want to delete this transaction?');
    if (!isConfirmed) return;

    try {
      await axios.delete(`/transactions/${selectedTransactionId}`);
      // Remove from local state so the row disappears immediately
      setTransactions(transactions.filter((t) => t.id !== selectedTransactionId));
      setSelectedTransactionId(null);
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  /**
   * Saves edits for a single transaction row.
   * Called by TransactionList when the user clicks ✓ on an editing row.
   *
   * @param {number} id   - The transaction ID to update
   * @param {Object} data - { amount, description, categoryId, createdAt }
   */
  const handleSaveEdit = async (id, { amount, description, categoryId, createdAt }) => {
    try {
      const res = await axios.put(`/transactions/${id}`, { amount, description, categoryId, createdAt });
      const updated = res.data; // raw DB row (no join), so we need to re-attach category info

      // Find the matching category from our local list so we can keep the display fields intact
      const matchedCategory = categories.find((c) => String(c.id) === String(categoryId));

      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...updated,
                category_name: matchedCategory?.name ?? null,
                category_icon: matchedCategory?.icon ?? null,
              }
            : t
        )
      );
    } catch (err) {
      console.error('Failed to update transaction:', err);
      alert('Failed to save changes. Please try again.');
    }
  };

  // --- Rendering ---
  return (
    <div className="transactions-page">
      <h1>Transactions</h1>

      {/* Search Bar Section */}
      <div className="mb-20">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mr-10"
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {/* Add New Transaction Form */}
      <TransactionForm onTransactionAdded={() => fetchTransactions()} />

      <hr className="my-32" />

      {/* Global Actions Bar */}
      <div className="mb-20 d-flex gap-10">
        <button
          onClick={handleDelete}
          disabled={!selectedTransactionId}
          className="btn-danger"
        >
          Delete Selected
        </button>
      </div>

      {/* Transaction History List — double-click any row to edit inline */}
      <TransactionList
        transactions={transactions}
        selectedTransactionId={selectedTransactionId}
        onSelectTransaction={setSelectedTransactionId}
        onSaveEdit={handleSaveEdit}
        categories={categories}
      />
    </div>
  );
}

export default Transactions;

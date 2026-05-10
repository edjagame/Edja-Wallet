import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';

/**
 * Transactions Page
 * 
 * Main container for managing the user's transactions.
 * Handles fetching, searching, and passing data to the child components.
 */
function Transactions() {
  // --- State Management ---
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

  // --- Data Fetching ---
  // Fetches transactions from the backend, optionally filtered by a search query
  const fetchTransactions = async (query = '') => {
    try {
      const res = await axios.get(`/transactions?search=${query}`);
      setTransactions(res.data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  // Load transactions exactly once when the page first loads
  useEffect(() => {
    fetchTransactions();
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

    // Ask for confirmation before deleting
    const isConfirmed = window.confirm("Are you sure you want to delete this transaction?");
    if (!isConfirmed) return;

    try {
      await axios.delete(`/transactions/${selectedTransactionId}`);
      // Remove it from the local state so it disappears from the screen
      setTransactions(transactions.filter(t => t.id !== selectedTransactionId));
      // Clear the selection
      setSelectedTransactionId(null);
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("Failed to delete transaction. Please try again.");
    }
  };

  // --- Rendering ---
  return (
    <div className="transactions-page">
      <h1>Transactions</h1>

      {/* Search Bar Section */}
      <div style={{ marginBottom: '20px' }}>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ marginRight: '10px' }}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {/* Add New Transaction Form */}
      <TransactionForm onTransactionAdded={() => fetchTransactions()} />

      <hr style={{ margin: '2rem 0' }} />

      {/* Global Actions Bar */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={handleDelete} 
          disabled={!selectedTransactionId}
          style={{ backgroundColor: selectedTransactionId ? '#dc3545' : '#ccc', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: selectedTransactionId ? 'pointer' : 'not-allowed' }}
        >
          Delete Selected
        </button>
        <button 
          disabled={!selectedTransactionId}
          style={{ backgroundColor: selectedTransactionId ? '#ffc107' : '#ccc', color: 'black', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: selectedTransactionId ? 'pointer' : 'not-allowed' }}
        >
          Edit Selected (Coming Soon)
        </button>
      </div>

      {/* Transaction History List */}
      <TransactionList 
        transactions={transactions} 
        selectedTransactionId={selectedTransactionId}
        onSelectTransaction={setSelectedTransactionId} 
      />
    </div>
  );
}

export default Transactions;

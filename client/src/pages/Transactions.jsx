import React, { useState, useCallback, useEffect } from 'react';
import axios from '../api/axios';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import TransactionSearch from '../components/TransactionSearch';

const getDefaultFilters = () => ({
  search: '',
  month: new Date().toISOString().substring(0, 7),
  categoryId: '',
  minAmount: '',
  maxAmount: ''
});

/**
 * Main container for viewing, filtering, adding, editing, and deleting
 * transactions.
 */
function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

  // Month defaults keep the transaction list focused on the current budget period.
  const [activeFilters, setActiveFilters] = useState(getDefaultFilters);

  const fetchTransactions = useCallback(async (filters = getDefaultFilters()) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.month) params.append('month', filters.month);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.minAmount) params.append('minAmount', filters.minAmount);
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);

      const res = await axios.get(`/transactions?${params.toString()}`);
      setTransactions(res.data);
      setActiveFilters(filters);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  }, []);

  // Categories are shared by the add form and the inline edit dropdown.
  const fetchCategories = async () => {
    try {
      const res = await axios.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [fetchTransactions]);

  const handleSearch = (filters) => {
    fetchTransactions(filters);
  };

  const handleDelete = async () => {
    if (!selectedTransactionId) return;

    const isConfirmed = window.confirm('Are you sure you want to delete this transaction?');
    if (!isConfirmed) return;

    try {
      await axios.delete(`/transactions/${selectedTransactionId}`);
      setTransactions(transactions.filter((t) => t.id !== selectedTransactionId));
      setSelectedTransactionId(null);
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  /**
   * Saves edits for a single transaction row. The update endpoint returns the
   * raw transaction row, so category display fields are re-attached locally.
   */
  const handleSaveEdit = async (id, { amount, description, categoryId, occurredAt }) => {
    try {
      const res = await axios.put(`/transactions/${id}`, { amount, description, categoryId, occurredAt });
      const updated = res.data;
      const matchedCategory = categories.find((c) => String(c.id) === String(categoryId));

      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...updated,
                category_name: matchedCategory?.name ?? null,
                category_icon: matchedCategory?.icon ?? null,
                category_type: matchedCategory?.type ?? null,
              }
            : t
        )
      );
    } catch (err) {
      console.error('Failed to update transaction:', err);
      alert('Failed to save changes. Please try again.');
    }
  };

  return (
    <div className="transactions-page">
      <h1>Transactions</h1>

      <TransactionSearch onSearch={handleSearch} categories={categories} />
      <TransactionForm onTransactionAdded={() => fetchTransactions(activeFilters)} />

      <hr className="my-32" />

      <div className="mb-20 d-flex gap-10">
        <button
          onClick={handleDelete}
          disabled={!selectedTransactionId}
          className="btn-danger"
        >
          Delete Selected
        </button>
      </div>

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

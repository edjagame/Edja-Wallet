import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import BudgetForm from '../components/BudgetForm';
import BudgetList from '../components/BudgetList';

/**
 * Budgets Page
 * 
 * Main container for managing budgets.
 * Handles fetching budgets, displaying forms,
 * and listing items with deletion capability, filtered by month.
 */
function Budgets() {
  // --- State Management ---
  const [budgets, setBudgets] = useState([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState(null);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().substring(0, 7));

  // --- Data Fetching ---
  const fetchBudgets = async () => {
    try {
      const res = await axios.get(`/budgets?month=${filterMonth}`);
      setBudgets(res.data);
    } catch (err) {
      console.error("Error fetching budgets:", err);
    }
  };

  // Load data when the component mounts or month filter changes
  useEffect(() => {
    fetchBudgets();
  }, [filterMonth]);

  // --- Event Handlers ---
  const handleSetCurrentMonth = () => {
    setFilterMonth(new Date().toISOString().substring(0, 7));
  };

  const handleDeleteBudget = async () => {
    if (!selectedBudgetId) return;
    const isConfirmed = window.confirm("Are you sure you want to delete this budget?");
    if (!isConfirmed) return;

    try {
      await axios.delete(`/budgets/${selectedBudgetId}`);
      setBudgets(budgets.filter(b => b.id !== selectedBudgetId));
      setSelectedBudgetId(null);
    } catch (err) {
      console.error("Failed to delete budget:", err);
    }
  };

  // --- Rendering ---
  return (
    <div className="budgets-page">
      <section className="mb-40">
        <h1>Budgets</h1>
        
        {/* Filter Section */}
        <div className="mb-20">
          <label className="mr-10">Filter by Month:</label>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            title="Leave blank to view all transactions"
            className="mr-10"
          />
          <button type="button" onClick={handleSetCurrentMonth}>Current Month</button>
        </div>

        <BudgetForm />
        
        <div className="mb-20 mt-20">
          <button onClick={handleDeleteBudget} disabled={!selectedBudgetId} className="btn-danger">
            Delete Selected Budget
          </button>
        </div>
        
        <BudgetList 
          budgets={budgets} 
          selectedBudgetId={selectedBudgetId} 
          onSelectBudget={setSelectedBudgetId} 
        />
      </section>
    </div>
  );
}

export default Budgets;
import React, { useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';
import BudgetChart from '../components/BudgetChart';
import TransactionForm from '../components/TransactionForm';

/**
 * Dashboard Page
 * 
 * Provides an overview of the user's financial status,
 * including a visualization of their budgets.
 */
function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [budgets, setBudgets] = useState([]);

  const fetchBudgets = async () => {
    try {
      const currentMonth = new Date().toISOString().substring(0, 7);
      const res = await axios.get(`/budgets?month=${currentMonth}`);
      setBudgets(res.data);
    } catch (err) {
      console.error('Error fetching budgets:', err);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const totalLimit = budgets.reduce((acc, b) => acc + parseFloat(b.monthly_limit || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + parseFloat(b.amount_spent || 0), 0);

  return (
    <div className="App">
      <div className="card">
        <h1>Dashboard</h1>
        <p>Welcome back, {user.name || 'User'}!</p>

        <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0' }}>
          <div>
            <h3>Total Limit</h3>
            <p className="amount">{totalLimit.toFixed(2)}</p>
          </div>
          <div>
            <h3>Total Spent</h3>
            <p className="amount" style={{ color: totalSpent > totalLimit ? '#EF4444' : 'inherit' }}>
              {totalSpent.toFixed(2)}
            </p>
          </div>
        </div>

        <BudgetChart budgets={budgets} />

        <hr style={{ margin: '30px 0' }} />

        <div style={{ marginBottom: '30px' }}>
          <TransactionForm onTransactionAdded={fetchBudgets} />
        </div>

        <button onClick={logout}>Log Out</button>
      </div>
    </div>
  );
}

export default Dashboard;

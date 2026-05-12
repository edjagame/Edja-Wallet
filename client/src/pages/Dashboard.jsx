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
  
  // --- State Management ---
  const [budgets, setBudgets] = useState([]);  

  // --- Data Fetching ---
  // Retrieves the user's budget records from the API for the current month
  const fetchBudgets = async () => {
    try{
      const currentMonth = new Date().toISOString().substring(0, 7);
      const res = await axios.get(`/budgets?month=${currentMonth}`);
      setBudgets(res.data);
    } catch (err) {
      console.error('Error fetching budgets:', err);
    }
  };

  // Fetch initial data on component mount
  useEffect(() =>{
    fetchBudgets();
  },[]);

  // Auth Guard: Redirect unauthenticated users to Login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Calculate Totals
  const totalLimit = budgets.reduce((acc, b) => acc + parseFloat(b.monthly_limit || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + parseFloat(b.amount_spent || 0), 0);

  // --- Rendering ---
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

        {/* Visual breakdown of budgets */}
        <BudgetChart budgets = {budgets}/>

        <hr style={{ margin: '30px 0' }} />

        {/* Quick Transaction Entry */}
        <div style={{ marginBottom: '30px' }}>
          <TransactionForm onTransactionAdded={fetchBudgets} />
        </div>
        
        <button onClick={logout}>Log Out</button>
      </div>
    </div>
  );
}

export default Dashboard;

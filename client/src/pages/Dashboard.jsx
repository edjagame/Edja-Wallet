import React, { useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';
import BudgetChart from '../components/BudgetChart';

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  
  const [budgets, setBudgets] = useState([]);  

  // Fetch budgets from the backend
  const fetchBudgets = async () => {
    try{
      const res = await axios.get(`/budgets`);
      setBudgets(res.data);
    } catch (err) {
      console.error('Error fetching budgets:', err);
    }
  };

  useEffect(() =>{
    fetchBudgets();
  },[]);

  // If the user isn't logged in, redirect them to the login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="App">
      <div className="card">
        <h1>Dashboard</h1>
        <p>Welcome back, {user.name || 'User'}!</p>
        <BudgetChart budgets = {budgets}/>
        <button onClick={logout}>Log Out</button>
      </div>
    </div>
  );
}

export default Dashboard;

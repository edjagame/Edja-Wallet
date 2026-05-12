import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

/**
 * BudgetForm Component
 * 
 * Provides a form for creating a new budget linked to a category.
 * Triggers a callback on successful creation.
 */
function BudgetForm() {
  // --- State Management ---
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [inputMonth, setInputMonth] = useState((new Date().getMonth() + 1).toString());
  const [inputYear, setInputYear] = useState(new Date().getFullYear().toString());

  // Fetch categories to populate the dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories for budget form:", err);
      }
    };
    fetchCategories();
  }, []);

  // --- Event Handlers ---
  // Submits the form data to create a new budget
  const handleAddBudget = async (e) => {
    e.preventDefault();
    try {
      const formattedMonth = `${inputYear}-${inputMonth.padStart(2, '0')}-01`;
      await axios.post('/budgets', { 
        category_id: categoryId, 
        monthly_limit: monthlyLimit, 
        month: formattedMonth 
      });
      // Reset form fields
      setCategoryId('');
      setMonthlyLimit('');
      setInputMonth((new Date().getMonth() + 1).toString());
      setInputYear(new Date().getFullYear().toString());
      alert("Budget created successfully");
    } catch (err) {
      console.error("Error adding budget:", err);
    }
  };

  // --- Rendering ---
  return (
    <form onSubmit={handleAddBudget} className="mb-20">
      <select 
        value={categoryId} 
        onChange={e => setCategoryId(e.target.value)} 
        required 
        className="mr-10"
      >
        <option value="">Select Category</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Monthly Limit"
        value={monthlyLimit}
        onChange={e => setMonthlyLimit(e.target.value)}
        required
        min="0.01"
        step="0.01"
        className="mr-10"
      />
      <select
        value={inputMonth}
        onChange={e => setInputMonth(e.target.value)}
        required
        className="mr-10"
      >
        <option value="">Month</option>
        <option value="1">January</option>
        <option value="2">February</option>
        <option value="3">March</option>
        <option value="4">April</option>
        <option value="5">May</option>
        <option value="6">June</option>
        <option value="7">July</option>
        <option value="8">August</option>
        <option value="9">September</option>
        <option value="10">October</option>
        <option value="11">November</option>
        <option value="12">December</option>
      </select>
      <input
        type="number"
        value={inputYear}
        onChange={e => setInputYear(e.target.value)}
        required
        min="2000"
        max="2100"
        className="mr-10"
        style={{ width: '80px' }}
      />
      <button type="submit">Add Budget</button>
    </form>
  );
}

export default BudgetForm;

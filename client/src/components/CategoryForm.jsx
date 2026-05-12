import React, { useState } from 'react';
import axios from '../api/axios';

/**
 * CategoryForm Component
 * 
 * Provides a form for creating a new category with a name, type, and optional icon.
 * Triggers a callback on successful creation.
 */
function CategoryForm({ onCategoryAdded }) {
  // --- State Management ---
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [icon, setIcon] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // --- Event Handlers ---
  // Submits the form data to create a new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await axios.post('/categories', { name, type, icon });
      // Reset form fields
      setName('');
      setType('expense');
      setIcon('');
      setMessage("Category created successfully!");
      if (onCategoryAdded) {
        onCategoryAdded(res.data);
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error("Error adding category:", err);
      // Give a nicer error, especially if duplicate
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
         setError("Failed to add category. Note: Names must be unique for each type.");
      }
      setTimeout(() => setError(''), 4000);
    }
  };

  // --- Rendering ---
  return (
    <div className="mb-20">
      {message && <p className="text-success">{message}</p>}
      {error && <p className="text-danger" style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input
          type="text"
          placeholder="Icon (e.g. 🍔)"
          value={icon}
          onChange={e => setIcon(e.target.value)}
        />
        <button type="submit">Add Category</button>
      </form>
    </div>
  );
}

export default CategoryForm;

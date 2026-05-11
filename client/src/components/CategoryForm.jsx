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

  // --- Event Handlers ---
  // Submits the form data to create a new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/categories', { name, type, icon });
      // Reset form fields
      setName('');
      setType('expense');
      setIcon('');
      // Notify parent component that a category was added
      if (onCategoryAdded) {
        onCategoryAdded();
      }
    } catch (err) {
      console.error("Error adding category:", err);
    }
  };

  // --- Rendering ---
  return (
    <form onSubmit={handleAddCategory} style={{ marginBottom: '20px' }}>
      <input
        type="text"
        placeholder="Category Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        style={{ marginRight: '10px' }}
      />
      <select value={type} onChange={e => setType(e.target.value)} style={{ marginRight: '10px' }}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <input
        type="text"
        placeholder="Icon (e.g. 🍔)"
        value={icon}
        onChange={e => setIcon(e.target.value)}
        style={{ marginRight: '10px' }}
      />
      <button type="submit">Add Category</button>
    </form>
  );
}

export default CategoryForm;

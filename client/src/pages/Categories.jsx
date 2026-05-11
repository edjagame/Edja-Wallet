import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import CategoryForm from '../components/CategoryForm';
import CategoryList from '../components/CategoryList';

/**
 * Categories Page
 * 
 * Main container for managing transaction categories.
 * Handles fetching categories, displaying the creation form,
 * and listing the categories with deletion capability.
 */
function Categories() {
  // --- State Management ---
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // --- Data Fetching ---
  // Retrieves the user's categories from the backend
  const fetchCategories = async () => {
    try {
      const res = await axios.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Load categories when the component amounts
  useEffect(() => {
    fetchCategories();
  }, []);

  // --- Event Handlers ---
  // Deletes the currently selected category
  const handleDelete = async () => {
    if (!selectedCategoryId) return;

    // Ask for confirmation before deleting
    const isConfirmed = window.confirm("Are you sure you want to delete this category?");
    if (!isConfirmed) return;

    try {
      await axios.delete(`/categories/${selectedCategoryId}`);
      // Remove it from the local state
      setCategories(categories.filter(c => c.id !== selectedCategoryId));
      // Clear the selection
      setSelectedCategoryId(null);
    } catch (err) {
      console.error("Failed to delete category:", err);
      alert("Failed to delete category.");
    }
  };

  // --- Rendering ---
  return (
    <div className="categories-page">
      <h1>Categories</h1>

      {/* Add New Category Form */}
      <CategoryForm onCategoryAdded={fetchCategories} />

      {/* Global Actions Bar */}
      <div className="mb-20">
        <button 
          onClick={handleDelete} 
          disabled={!selectedCategoryId}
          className="btn-danger"
        >
          Delete Selected
        </button>
      </div>

      {/* Category List */}
      <CategoryList 
        categories={categories} 
        selectedCategoryId={selectedCategoryId} 
        onSelectCategory={setSelectedCategoryId} 
      />
    </div>
  );
}

export default Categories;

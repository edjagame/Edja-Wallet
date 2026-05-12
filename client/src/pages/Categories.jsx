import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import CategoryForm from '../components/CategoryForm';
import CategoryList from '../components/CategoryList';

/**
 * Categories Page
 * 
 * Main container for managing transaction categories.
 * Handles fetching categories, displaying forms,
 * and listing items with deletion capability.
 */
function Categories() {
  // --- State Management ---
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // --- Data Fetching ---
  const fetchCategories = async () => {
    try {
      const res = await axios.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Load data when the component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  // --- Event Handlers ---
  const handleDeleteCategory = async () => {
    if (!selectedCategoryId) return;
    const isConfirmed = window.confirm("Are you sure you want to delete this category?");
    if (!isConfirmed) return;

    try {
      await axios.delete(`/categories/${selectedCategoryId}`);
      setCategories(categories.filter(c => c.id !== selectedCategoryId));
      setSelectedCategoryId(null);
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  };

  // --- Rendering ---
  return (
    <div className="categories-page">
      <section className="mb-40">
        <h1>Categories</h1>
        <CategoryForm />
        <div className="mb-20">
          <button onClick={handleDeleteCategory} disabled={!selectedCategoryId} className="btn-danger">
            Delete Selected Category
          </button>
        </div>
        <CategoryList 
          categories={categories} 
          selectedCategoryId={selectedCategoryId} 
          onSelectCategory={setSelectedCategoryId} 
        />
      </section>
    </div>
  );
}

export default Categories;

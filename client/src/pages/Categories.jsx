import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import CategoryForm from '../components/CategoryForm';
import CategoryList from '../components/CategoryList';
import Modal from '../components/Modal';

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
  const handleCategoryAdded = (newCategory) => {
    setCategories([...categories, newCategory]);
  };

  const confirmDeleteCategory = () => {
    if (!selectedCategoryId) return;
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategoryId) return;

    try {
      await axios.delete(`/categories/${selectedCategoryId}`);
      setCategories(categories.filter(c => c.id !== selectedCategoryId));
      setSelectedCategoryId(null);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Failed to delete category:", err);
      // Even if there is an error, close the modal so they are not stuck
      setIsDeleteModalOpen(false);
    }
  };

  // --- Rendering ---
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const isOtherSelected = selectedCategory && selectedCategory.name.toLowerCase() === 'other';

  return (
    <div className="categories-page">
      <section className="mb-40">
        <h1>Categories</h1>
        <CategoryForm onCategoryAdded={handleCategoryAdded} />
        <div className="mb-20">
          <button 
            onClick={confirmDeleteCategory} 
            disabled={!selectedCategoryId || isOtherSelected} 
            className="btn-danger"
            title={isOtherSelected ? "The 'Other' category cannot be deleted" : ""}
          >
            Delete Selected Category
          </button>
        </div>
        <CategoryList 
          categories={categories} 
          selectedCategoryId={selectedCategoryId} 
          onSelectCategory={setSelectedCategoryId} 
        />
      </section>

      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Confirm Deletion"
      >
        <p>Are you sure you want to delete this category? Proceeding will not delete previous transactions under this category but will leave them uncategorized.</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button className="btn-danger" onClick={handleDeleteCategory}>Delete Category</button>
            <button onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}

export default Categories;

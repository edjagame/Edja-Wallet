import React from 'react';

/**
 * CategoryList Component
 * 
 * Displays a list of categories in a grid.
 * Allows selecting a category by clicking on it.
 */
function CategoryList({ categories, selectedCategoryId, onSelectCategory }) {
  // --- Rendering ---
  return (
    <div className="grid-col-1 gap-10">
      {categories.length > 0 ? (
        categories.map(category => (
          <div 
            key={category.id} 
            onClick={() => onSelectCategory(category.id === selectedCategoryId ? null : category.id)}
            className={`category-item ${category.id === selectedCategoryId ? 'selected' : ''}`}
          >
            <strong>{category.icon} {category.name}</strong> ({category.type})
          </div>
        ))
      ) : (
        <p>No categories found.</p>
      )}
    </div>
  );
}

export default CategoryList;

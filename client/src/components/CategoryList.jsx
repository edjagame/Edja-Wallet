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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
      {categories.length > 0 ? (
        categories.map(category => (
          <div 
            key={category.id} 
            onClick={() => onSelectCategory(category.id === selectedCategoryId ? null : category.id)}
            style={{
              border: '1px solid #ddd', 
              padding: '10px', 
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: category.id === selectedCategoryId ? '#e9ecef' : '#fff'
            }}
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

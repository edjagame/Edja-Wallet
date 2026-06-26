import React from 'react';

/**
 * Displays selectable category rows.
 */
function CategoryList({ categories, selectedCategoryId, onSelectCategory }) {
  return (
    <div className="grid-col-1 gap-10">
      {categories.length > 0 ? (
        categories.map((category) => (
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

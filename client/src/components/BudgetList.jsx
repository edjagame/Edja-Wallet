import React from 'react';

/**
 * Displays selectable budget rows for the current filter.
 */
function BudgetList({ budgets, selectedBudgetId, onSelectBudget }) {
  return (
    <div className="grid-col-1 gap-10">
      {budgets.length > 0 ? (
        budgets.map((budget) => (
          <div
            key={budget.id}
            onClick={() => onSelectBudget(budget.id === selectedBudgetId ? null : budget.id)}
            className={`budget-item ${budget.id === selectedBudgetId ? 'selected' : ''}`}
          >
            <strong>{budget.category_icon} {budget.category_name}</strong> - Limit: {budget.monthly_limit} ({new Date(budget.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })})
          </div>
        ))
      ) : (
        <p>No budgets found.</p>
      )}
    </div>
  );
}

export default BudgetList;

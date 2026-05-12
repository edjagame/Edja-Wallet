import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * BudgetChart Component
 * 
 * Renders a visual breakdown of user budgets and spending using a Bar Chart.
 * Utilizes the 'recharts' library for data visualization.
 */
function BudgetChart({ budgets }) {
  // Transform the 'budgets' prop into the format 'recharts' expects
  const data = budgets.map(budget => ({
    name: budget.category_name || `Category ${budget.category_id}`,
    Limit: parseFloat(budget.monthly_limit),
    Spent: parseFloat(budget.amount_spent || 0)
  }));

  // Empty state check: Display informative message if no budgets exist
  if (!budgets || budgets.length === 0) {
    return <p>No budgets found. Let's add some!</p>;
  }

  return (
    <div style={{ width: '100%', height: 350 }}>
      {/* ResponsiveContainer ensures the chart maintains its aspect ratio */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip cursor={{fill: 'transparent'}} />
          <Legend />
          <Bar dataKey="Spent" fill="#EF4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Limit" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BudgetChart;

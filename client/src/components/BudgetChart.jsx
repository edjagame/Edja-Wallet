import React from 'react';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';

function BudgetChart({ budgets }) {
  // TODO: Transform the 'budgets' prop into the format 'recharts' expects
  // Recharts needs an array of objects like { name: 'Category', value: 100 }
  /*
  const data = budgets.map(budget => ({
    name: `Category ${budget.category_id}`, // You might want to join category names in the backend later!
    value: parseFloat(budget.monthly_limit)
  }));
  */

  const data = budgets.map(budget => ({
    name: `Category ${budget.category_id}`,
    value: parseFloat(budget.monthly_limit)
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // TODO: Let's add an "Empty State" check!
  // If the budgets array is empty, display a message instead of the chart.
  if (!budgets || budgets.length === 0) {
    return <p>No budgets found. Let's add some!</p>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      {/* TODO: Use ResponsiveContainer so the chart fits your layout */}
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BudgetChart;

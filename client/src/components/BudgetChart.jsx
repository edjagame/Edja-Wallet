import React from 'react';
import { PieChart, Pie, Tooltip, Cell } from 'recharts';

function BudgetChart() {
  const data = [
    { name: 'Rent', value: 1000 },
    { name: 'Food', value: 300 },
    { name: 'Entertainment', value: 150 }
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <PieChart width={400} height={400}>
      <Pie
        data={data}
        cx={200}
        cy={200}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
}

export default BudgetChart;

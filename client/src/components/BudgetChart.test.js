import { render, screen } from '@testing-library/react';
import BudgetChart from './BudgetChart';

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />
}));

test('renders the empty state when there are no budgets', () => {
  render(<BudgetChart budgets={[]} />);

  expect(screen.getByText("No budgets found. Let's add some!")).toBeInTheDocument();
});

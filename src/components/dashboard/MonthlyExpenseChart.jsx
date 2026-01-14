import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { EXPENSE_CATEGORIES } from '../../hooks/useExpenses';

/**
 * Get category label from value
 */
const getCategoryLabel = (value) => {
  const category = EXPENSE_CATEGORIES.find((c) => c.value === value);
  return category?.label || value;
};

/**
 * Monthly Expense Chart Component
 * Shows expenses grouped by month
 */
function MonthlyExpenseChart({ expenses }) {
  const chartData = useMemo(() => {
    // Get last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      });
    }

    // Aggregate expenses by month
    return months.map(({ year, month, label }) => {
      const monthStr = String(month).padStart(2, '0');
      const prefix = `${year}-${monthStr}`;
      const monthExpenses = expenses.filter((e) => e.date?.startsWith(prefix));

      const total = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      return {
        name: label,
        total,
      };
    });
  }, [expenses]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Monthly Expenses
        </h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No expenses recorded yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Monthly Expenses
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total: <span className="font-bold text-gray-800 dark:text-white">₱{totalExpenses.toFixed(2)}</span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
            />
            <YAxis
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
              tickFormatter={(value) => `₱${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
              formatter={(value) => [`₱${value.toFixed(2)}`, 'Total']}
            />
            <Bar dataKey="total" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MonthlyExpenseChart;

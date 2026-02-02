import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Building2, User } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../../hooks/useExpenses';

/**
 * Category colors for the pie chart
 */
const CATEGORY_COLORS = {
  mortgage: '#EC4899',
  electricity: '#FBBF24',
  water: '#3B82F6',
  internet: '#8B5CF6',
  maintenance: '#F97316',
  repairs: '#EF4444',
  supplies: '#10B981',
  taxes: '#6B7280',
  insurance: '#6366F1',
  other: '#9CA3AF',
};

/**
 * Get category label from value
 */
const getCategoryLabel = (value) => {
  const category = EXPENSE_CATEGORIES.find((c) => c.value === value);
  return category?.label || value;
};

/**
 * Format currency
 */
const formatCurrency = (value) => {
  return `₱${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Expense By Category Chart Component
 * Shows expenses breakdown by category as a pie chart
 */
function ExpenseByCategoryChart({ expenses }) {
  const { chartData, typeSummary } = useMemo(() => {
    // Group expenses by category
    const categoryTotals = {};
    let apartmentTotal = 0;
    let personalTotal = 0;

    expenses.forEach((expense) => {
      const category = expense.category || 'other';
      const amount = expense.amount || 0;
      const expenseType = expense.expenseType || 'apartment';

      categoryTotals[category] = (categoryTotals[category] || 0) + amount;

      if (expenseType === 'personal') {
        personalTotal += amount;
      } else {
        apartmentTotal += amount;
      }
    });

    // Convert to array and sort by value
    const data = Object.entries(categoryTotals)
      .map(([category, value]) => ({
        name: getCategoryLabel(category),
        value,
        category,
      }))
      .sort((a, b) => b.value - a.value);

    return {
      chartData: data,
      typeSummary: { apartmentTotal, personalTotal },
    };
  }, [expenses]);

  if (expenses.length === 0 || chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Expenses by Category
        </h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No expenses recorded yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
        Expenses by Category
      </h3>
      {/* Expense Type Summary */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
          <Building2 className="w-3 h-3" />
          Apartment: {formatCurrency(typeSummary.apartmentTotal)}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
          <User className="w-3 h-3" />
          Personal: {formatCurrency(typeSummary.personalTotal)}
        </span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.other}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
              formatter={(value) => [`₱${value.toFixed(2)}`, '']}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ExpenseByCategoryChart;

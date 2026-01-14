import { Edit2, Trash2, RefreshCw } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../../hooks/useExpenses';

/**
 * Get category label from value
 */
const getCategoryLabel = (value) => {
  const category = EXPENSE_CATEGORIES.find((c) => c.value === value);
  return category?.label || value;
};

/**
 * Get category badge color
 */
const getCategoryColor = (category) => {
  const colors = {
    electricity: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    water: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    internet: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    maintenance: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    repairs: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    supplies: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    taxes: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    insurance: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };
  return colors[category] || colors.other;
};

/**
 * Format date to readable format
 */
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Expenses Table Component
 * Displays a list of expenses with actions
 */
function ExpensesTable({ expenses, onEdit, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-400">
        No expenses recorded yet. Add your first expense above.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Category
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Description
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Date
              </th>
              <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Amount
              </th>
              <th className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-3 md:px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                      expense.category
                    )}`}
                  >
                    {getCategoryLabel(expense.category)}
                    {expense.recurring && (
                      <RefreshCw className="w-3 h-3" title="Recurring expense" />
                    )}
                  </span>
                </td>
                <td className="px-3 md:px-6 py-4 text-gray-900 dark:text-white">
                  <div>{expense.description}</div>
                  {expense.notes && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {expense.notes}
                    </div>
                  )}
                </td>
                <td className="px-3 md:px-6 py-4 text-gray-600 dark:text-gray-300">
                  {formatDate(expense.date)}
                </td>
                <td className="px-3 md:px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                  ₱{(expense.amount || 0).toFixed(2)}
                </td>
                <td className="px-3 md:px-6 py-4">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => onEdit(expense)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                      title="Edit expense"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <td colSpan="3" className="px-3 md:px-6 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                Total:
              </td>
              <td className="px-3 md:px-6 py-3 text-right font-bold text-gray-900 dark:text-white">
                ₱{expenses.reduce((sum, e) => sum + (e.amount || 0), 0).toFixed(2)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default ExpensesTable;

import { Edit2, Trash2, RefreshCw, Building2, User, Copy, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { EXPENSE_CATEGORIES, RECURRING_OPTIONS, EXPENSE_TYPES } from '../../hooks/useExpenses';

/**
 * Sortable Header Component
 */
function SortableHeader({ field, label, sortField, sortDirection, onSort, className = '', align = 'left' }) {
  const isActive = sortField === field;

  const getSortIcon = () => {
    if (!onSort) return null;
    if (!isActive) return <ArrowUpDown className="w-3 h-3 opacity-50" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  const alignClass = align === 'right' ? 'justify-end' : 'justify-start';

  return (
    <th className={`px-3 md:px-6 py-3 text-${align} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase ${className}`}>
      <button
        onClick={() => onSort?.(field)}
        className={`flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-100 transition-colors ${alignClass}`}
      >
        {label}
        {getSortIcon()}
      </button>
    </th>
  );
}

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
    mortgage: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    electricity: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    water: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    internet: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    cable: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300',
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
 * Get recurring frequency label
 */
const getFrequencyLabel = (value) => {
  const option = RECURRING_OPTIONS.find((o) => o.value === value);
  return option?.label || 'One-time';
};

/**
 * Get expense type label
 */
const getExpenseTypeLabel = (value) => {
  const type = EXPENSE_TYPES.find((t) => t.value === value);
  return type?.label || 'Apartment';
};

/**
 * Get expense type badge color and icon
 */
const getExpenseTypeStyle = (type) => {
  if (type === 'personal') {
    return {
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      Icon: User,
    };
  }
  return {
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    Icon: Building2,
  };
};

/**
 * Expenses Table Component
 * Displays a list of expenses with actions
 */
function ExpensesTable({
  expenses,
  onEdit,
  onDuplicate,
  onDelete,
  sortField = 'date',
  sortDirection = 'desc',
  onSort,
}) {
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
              <SortableHeader
                field="expenseType"
                label="Type"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableHeader
                field="category"
                label="Category"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableHeader
                field="description"
                label="Description"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableHeader
                field="date"
                label="Date"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableHeader
                field="recurringFrequency"
                label="Frequency"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableHeader
                field="amount"
                label="Amount"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
                align="right"
              />
              <th className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {expenses.map((expense) => {
              const typeStyle = getExpenseTypeStyle(expense.expenseType);
              return (
              <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-3 md:px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeStyle.color}`}
                  >
                    <typeStyle.Icon className="w-3 h-3" />
                    {getExpenseTypeLabel(expense.expenseType)}
                  </span>
                </td>
                <td className="px-3 md:px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                      expense.category
                    )}`}
                  >
                    {getCategoryLabel(expense.category)}
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
                <td className="px-3 md:px-6 py-4 text-gray-600 dark:text-gray-300">
                  {expense.recurringFrequency && expense.recurringFrequency !== 'none' ? (
                    <span className="inline-flex items-center gap-1 text-xs">
                      <RefreshCw className="w-3 h-3" />
                      {getFrequencyLabel(expense.recurringFrequency)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">One-time</span>
                  )}
                </td>
                <td className="px-3 md:px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                  ₱{(expense.amount || 0).toFixed(2)}
                </td>
                <td className="px-3 md:px-6 py-4">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => onDuplicate(expense)}
                      className="text-purple-500 hover:text-purple-700 p-1"
                      title="Duplicate expense"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
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
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <td colSpan="5" className="px-3 md:px-6 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
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

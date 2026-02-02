import { Filter, Building2, User } from 'lucide-react';
import { EXPENSE_TYPES, EXPENSE_CATEGORIES } from '../../hooks/useExpenses';

/**
 * Expense Filters Component
 * Provides filtering options for expense type and category
 */
function ExpenseFilters({ filters, onFilterChange }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Filter className="w-4 h-4" />
          <span className="font-medium text-sm">Filters:</span>
        </div>

        {/* Expense Type Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Type:</label>
          <select
            value={filters.expenseType || 'all'}
            onChange={(e) => onFilterChange('expenseType', e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Types</option>
            {EXPENSE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Category:</label>
          <select
            value={filters.category || 'all'}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Categories</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Type Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => onFilterChange('expenseType', 'all')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filters.expenseType === 'all' || !filters.expenseType
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange('expenseType', 'apartment')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filters.expenseType === 'apartment'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
            }`}
          >
            <Building2 className="w-3 h-3" />
            Apartment
          </button>
          <button
            onClick={() => onFilterChange('expenseType', 'personal')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filters.expenseType === 'personal'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
            }`}
          >
            <User className="w-3 h-3" />
            Personal
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExpenseFilters;

import { DollarSign, Save, X, Tag, Calendar, FileText, RefreshCw, Building2, User } from 'lucide-react';
import { EXPENSE_CATEGORIES, RECURRING_OPTIONS, EXPENSE_TYPES } from '../../hooks/useExpenses';

/**
 * Expense Form Component
 * Handles creating and editing expenses
 */
function ExpenseForm({ form, errors, isEditing, onSave, onCancel, onUpdateField }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        <DollarSign className="w-5 h-5" />
        {isEditing ? 'Edit Expense' : 'Add New Expense'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {form.expenseType === 'personal' ? (
              <User className="w-4 h-4 inline mr-1" aria-hidden="true" />
            ) : (
              <Building2 className="w-4 h-4 inline mr-1" aria-hidden="true" />
            )}
            Expense Type
          </label>
          <select
            value={form.expenseType || 'apartment'}
            onChange={(e) => onUpdateField('expenseType', e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {EXPENSE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Tag className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => onUpdateField('category', e.target.value)}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.category ? 'border-red-500' : ''
            }`}
            aria-invalid={!!errors.category}
          >
            <option value="">Select Category</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FileText className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Description
          </label>
          <input
            type="text"
            placeholder="e.g., Monthly electricity bill"
            value={form.description}
            onChange={(e) => onUpdateField('description', e.target.value)}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.description ? 'border-red-500' : ''
            }`}
            aria-invalid={!!errors.description}
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Amount (₱)
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={form.amount || ''}
            onChange={(e) => onUpdateField('amount', parseFloat(e.target.value) || 0)}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.amount ? 'border-red-500' : ''
            }`}
            aria-invalid={!!errors.amount}
            min="0"
            step="0.01"
          />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Date
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => onUpdateField('date', e.target.value)}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.date ? 'border-red-500' : ''
            }`}
            aria-invalid={!!errors.date}
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FileText className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Notes (Optional)
          </label>
          <input
            type="text"
            placeholder="Additional notes..."
            value={form.notes || ''}
            onChange={(e) => onUpdateField('notes', e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <RefreshCw className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Frequency
          </label>
          <select
            value={form.recurringFrequency || 'none'}
            onChange={(e) => onUpdateField('recurringFrequency', e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {RECURRING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2 mt-6">
        <button
          onClick={onSave}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isEditing ? 'Update' : 'Save'}
        </button>
        {isEditing && (
          <button
            onClick={onCancel}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default ExpenseForm;

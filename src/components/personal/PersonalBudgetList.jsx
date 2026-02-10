import { useState } from 'react';
import { Plus, Edit2, Trash2, PiggyBank, AlertTriangle, X, Save } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

/**
 * Personal Budget List Component
 * Manages budget allocation and tracking
 */
function PersonalBudgetList({
  budgets = [],
  categories = [],
  onAdd,
  onUpdate,
  onDelete
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [form, setForm] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly',
  });
  const [errors, setErrors] = useState({});

  // Format currency
  const formatCurrency = (amount) => {
    return `₱${(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Open form for adding
  const handleAdd = () => {
    setEditingBudget(null);
    setForm({ categoryId: '', amount: '', period: 'monthly' });
    setErrors({});
    setShowForm(true);
  };

  // Open form for editing
  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setForm({
      categoryId: budget.categoryId,
      amount: budget.amount,
      period: budget.period || 'monthly',
    });
    setErrors({});
    setShowForm(true);
  };

  // Close form
  const handleClose = () => {
    setShowForm(false);
    setEditingBudget(null);
  };

  // Update form field
  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};
    if (!form.categoryId) newErrors.categoryId = 'Please select a category';
    if (!form.amount || parseFloat(form.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validate()) return;

    const data = {
      categoryId: form.categoryId,
      amount: parseFloat(form.amount),
      period: form.period,
    };

    if (editingBudget) {
      await onUpdate(editingBudget.id, data);
    } else {
      await onAdd(data);
    }
    handleClose();
  };

  // Handle delete
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      onDelete(id);
    }
  };

  // Get unused categories (for new budgets)
  const usedCategoryIds = budgets.map(b => b.categoryId);
  const availableCategories = editingBudget
    ? categories
    : categories.filter(c => !usedCategoryIds.includes(c.id));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <PiggyBank className="w-6 h-6" />
          Budgets
        </h2>
        <button
          onClick={handleAdd}
          disabled={availableCategories.length === 0}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Budget
        </button>
      </div>

      {/* Budget List */}
      {budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget) => (
            <div
              key={budget.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow p-4 border-l-4 ${
                budget.isOverBudget ? 'border-red-500' : 'border-green-500'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {budget.categoryName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {budget.period} budget
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(budget)}
                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Spent</span>
                  <span className={`font-medium ${
                    budget.isOverBudget ? 'text-red-600' : 'text-gray-900 dark:text-white'
                  }`}>
                    {formatCurrency(budget.spent)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Budget</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(budget.amount)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      budget.isOverBudget ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs">
                  <span className={budget.isOverBudget ? 'text-red-500' : 'text-green-500'}>
                    {budget.percentage.toFixed(0)}% used
                  </span>
                  <span className={budget.remaining < 0 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}>
                    {budget.remaining < 0 ? 'Over by ' : 'Remaining: '}
                    {formatCurrency(Math.abs(budget.remaining))}
                  </span>
                </div>

                {budget.isOverBudget && (
                  <div className="flex items-center gap-2 text-red-500 text-xs mt-2">
                    <AlertTriangle className="w-4 h-4" />
                    Budget exceeded!
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
          <PiggyBank className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">No budgets set yet</p>
          <button
            onClick={handleAdd}
            className="text-blue-500 hover:text-blue-600"
          >
            Create your first budget
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingBudget ? 'Edit Budget' : 'Add Budget'}
              </h3>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <SearchableSelect
                  options={(editingBudget ? categories : availableCategories).map(cat => ({
                    value: cat.id,
                    label: cat.name,
                    color: cat.color,
                  }))}
                  value={form.categoryId}
                  onChange={(value) => updateField('categoryId', value)}
                  placeholder="Select Category"
                  searchPlaceholder="Search categories..."
                  error={!!errors.categoryId}
                  disabled={!!editingBudget}
                />
                {errors.categoryId && (
                  <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Budget Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => updateField('amount', e.target.value)}
                    placeholder="0.00"
                    className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.amount ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Period
                </label>
                <select
                  value={form.period}
                  onChange={(e) => updateField('period', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t dark:border-gray-700">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 border dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonalBudgetList;

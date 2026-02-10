import { useState } from 'react';
import {
  Plus, Edit2, Trash2, Repeat, Calendar, Play, Pause, AlertCircle,
  X, Save, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import SearchableSelect from './SearchableSelect';

/**
 * Personal Recurring List Component
 * Manages recurring transactions (subscriptions, bills, etc.)
 */
function PersonalRecurringList({
  recurring = [],
  categories = [],
  paymentMethods = [],
  onAdd,
  onUpdate,
  onDelete,
  onToggleActive,
  onProcessDue,
  dueCount = 0
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    categoryId: '',
    paymentMethodId: '',
    description: '',
    frequency: 'monthly',
    nextDueDate: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState({});

  // Frequency options
  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  // Format currency
  const formatCurrency = (amount) => {
    return `₱${(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Filter categories by type
  const filteredCategories = categories.filter(c => c.type === form.type);

  // Open form for adding
  const handleAdd = () => {
    setEditingRecurring(null);
    setForm({
      type: 'expense',
      amount: '',
      categoryId: '',
      paymentMethodId: '',
      description: '',
      frequency: 'monthly',
      nextDueDate: new Date().toISOString().split('T')[0],
    });
    setErrors({});
    setShowForm(true);
  };

  // Open form for editing
  const handleEdit = (item) => {
    setEditingRecurring(item);
    setForm({
      type: item.transactionTemplate?.type || 'expense',
      amount: item.transactionTemplate?.amount || '',
      categoryId: item.transactionTemplate?.categoryId || '',
      paymentMethodId: item.transactionTemplate?.paymentMethodId || '',
      description: item.transactionTemplate?.description || '',
      frequency: item.frequency || 'monthly',
      nextDueDate: item.nextDueDate || new Date().toISOString().split('T')[0],
    });
    setErrors({});
    setShowForm(true);
  };

  // Close form
  const handleClose = () => {
    setShowForm(false);
    setEditingRecurring(null);
  };

  // Update form field
  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    // Reset category when type changes
    if (field === 'type') {
      setForm(prev => ({ ...prev, categoryId: '' }));
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};
    if (!form.amount || parseFloat(form.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!form.categoryId) newErrors.categoryId = 'Please select a category';
    if (!form.nextDueDate) newErrors.nextDueDate = 'Please select a date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validate()) return;

    const data = {
      transactionTemplate: {
        type: form.type,
        amount: parseFloat(form.amount),
        categoryId: form.categoryId,
        paymentMethodId: form.paymentMethodId,
        description: form.description,
      },
      frequency: form.frequency,
      nextDueDate: form.nextDueDate,
      isActive: true,
    };

    if (editingRecurring) {
      await onUpdate(editingRecurring.id, data);
    } else {
      await onAdd(data);
    }
    handleClose();
  };

  // Handle delete
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
      onDelete(id);
    }
  };

  // Handle process due
  const handleProcessDue = async () => {
    if (dueCount === 0) return;
    if (window.confirm(`Create ${dueCount} transaction(s) from due recurring items?`)) {
      await onProcessDue();
    }
  };

  // Separate active and inactive
  const activeRecurring = recurring.filter(r => r.isActive);
  const inactiveRecurring = recurring.filter(r => !r.isActive);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Repeat className="w-6 h-6" />
          Recurring Transactions
        </h2>
        <div className="flex gap-2">
          {dueCount > 0 && (
            <button
              onClick={handleProcessDue}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
              Process {dueCount} Due
            </button>
          )}
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Recurring
          </button>
        </div>
      </div>

      {/* Active Recurring */}
      {activeRecurring.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active</h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {activeRecurring.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 ${item.isDue ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        item.transactionTemplate?.type === 'income'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        {item.transactionTemplate?.type === 'income' ? (
                          <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {item.transactionTemplate?.description || item.categoryName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="capitalize">{item.frequency}</span>
                          <span>•</span>
                          <span>{item.categoryName}</span>
                          {item.isDue && (
                            <>
                              <span>•</span>
                              <span className="text-orange-600 dark:text-orange-400 font-medium">
                                Due now
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${
                          item.transactionTemplate?.type === 'income'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatCurrency(item.transactionTemplate?.amount)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Next: {item.nextDueDate}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onToggleActive(item.id, false)}
                          className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg"
                          title="Pause"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inactive Recurring */}
      {inactiveRecurring.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Paused</h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden opacity-60">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {inactiveRecurring.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                        <Pause className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-600 dark:text-gray-400 truncate">
                          {item.transactionTemplate?.description || item.categoryName}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                          {item.frequency} • Paused
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="text-lg font-semibold text-gray-400">
                        {formatCurrency(item.transactionTemplate?.amount)}
                      </p>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onToggleActive(item.id, true)}
                          className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg"
                          title="Resume"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {recurring.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
          <Repeat className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">No recurring transactions yet</p>
          <button onClick={handleAdd} className="text-blue-500 hover:text-blue-600">
            Add your first recurring transaction
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingRecurring ? 'Edit Recurring' : 'Add Recurring'}
              </h3>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Type Toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateField('type', 'expense')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    form.type === 'expense'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => updateField('type', 'income')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    form.type === 'income'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="e.g., Netflix subscription"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount *
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
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <SearchableSelect
                  options={filteredCategories.map(cat => ({
                    value: cat.id,
                    label: cat.name,
                    color: cat.color,
                  }))}
                  value={form.categoryId}
                  onChange={(value) => updateField('categoryId', value)}
                  placeholder="Select Category"
                  searchPlaceholder="Search categories..."
                  error={!!errors.categoryId}
                />
                {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Method
                </label>
                <SearchableSelect
                  options={paymentMethods.map(pm => ({
                    value: pm.id,
                    label: pm.name,
                  }))}
                  value={form.paymentMethodId}
                  onChange={(value) => updateField('paymentMethodId', value)}
                  placeholder="Select Payment Method"
                  searchPlaceholder="Search payment methods..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Frequency
                </label>
                <select
                  value={form.frequency}
                  onChange={(e) => updateField('frequency', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {frequencies.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Next Due Date *
                </label>
                <input
                  type="date"
                  value={form.nextDueDate}
                  onChange={(e) => updateField('nextDueDate', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.nextDueDate ? 'border-red-500' : ''
                  }`}
                />
                {errors.nextDueDate && <p className="text-red-500 text-xs mt-1">{errors.nextDueDate}</p>}
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

export default PersonalRecurringList;

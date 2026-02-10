import { useState, useEffect } from 'react';
import { X, Save, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

/**
 * Personal Transaction Form Component
 * Modal form for adding/editing transactions
 */
function PersonalTransactionForm({
  transaction = null,
  categories = [],
  paymentMethods = [],
  onSave,
  onClose
}) {
  const isEditing = !!transaction;

  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    categoryId: '',
    paymentMethodId: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    tags: [],
  });

  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');

  // Load transaction data if editing
  useEffect(() => {
    if (transaction) {
      setForm({
        type: transaction.type || 'expense',
        amount: transaction.amount || '',
        categoryId: transaction.categoryId || '',
        paymentMethodId: transaction.paymentMethodId || '',
        date: transaction.date || new Date().toISOString().split('T')[0],
        description: transaction.description || '',
        tags: transaction.tags || [],
      });
    }
  }, [transaction]);

  // Filter categories by type
  const filteredCategories = categories.filter(c => c.type === form.type);

  // Update form field
  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle type change
  const handleTypeChange = (type) => {
    setForm(prev => ({
      ...prev,
      type,
      categoryId: '' // Reset category when type changes
    }));
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!form.amount || parseFloat(form.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!form.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!form.date) {
      newErrors.date = 'Please select a date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!validate()) return;

    const data = {
      ...form,
      amount: parseFloat(form.amount),
    };

    onSave(data);
  };

  // Handle key down for tags
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                form.type === 'expense'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <ArrowDownRight className="w-5 h-5" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                form.type === 'income'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <ArrowUpRight className="w-5 h-5" />
              Income
            </button>
          </div>

          {/* Amount */}
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
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Category */}
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
            {errors.categoryId && (
              <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>
            )}
          </div>

          {/* Payment Method */}
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

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => updateField('date', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.date ? 'border-red-500' : ''
              }`}
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Enter description..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-lg"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Save className="w-4 h-4" />
            {isEditing ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PersonalTransactionForm;

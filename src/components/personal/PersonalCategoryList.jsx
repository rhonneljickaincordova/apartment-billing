import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Tag, X, Save } from 'lucide-react';

/**
 * Personal Category List Component
 * Manages expense and income categories
 */
function PersonalCategoryList({
  categories = [],
  transactions = [],
  onAdd,
  onUpdate,
  onDelete
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('expense');
  const [form, setForm] = useState({
    name: '',
    type: 'expense',
    icon: 'Tag',
    color: 'gray',
  });
  const [errors, setErrors] = useState({});

  // Color options
  const colors = [
    { value: 'orange', bg: 'bg-orange-500', label: 'Orange' },
    { value: 'blue', bg: 'bg-blue-500', label: 'Blue' },
    { value: 'yellow', bg: 'bg-yellow-500', label: 'Yellow' },
    { value: 'purple', bg: 'bg-purple-500', label: 'Purple' },
    { value: 'pink', bg: 'bg-pink-500', label: 'Pink' },
    { value: 'red', bg: 'bg-red-500', label: 'Red' },
    { value: 'teal', bg: 'bg-teal-500', label: 'Teal' },
    { value: 'indigo', bg: 'bg-indigo-500', label: 'Indigo' },
    { value: 'green', bg: 'bg-green-500', label: 'Green' },
    { value: 'cyan', bg: 'bg-cyan-500', label: 'Cyan' },
    { value: 'gray', bg: 'bg-gray-500', label: 'Gray' },
  ];

  const getColorClass = (color) => {
    return colors.find(c => c.value === color)?.bg || 'bg-gray-500';
  };

  // Calculate category stats
  const categoryStats = useMemo(() => {
    const stats = {};
    transactions.forEach(t => {
      const catId = t.categoryId;
      if (!stats[catId]) {
        stats[catId] = { count: 0, total: 0 };
      }
      stats[catId].count += 1;
      stats[catId].total += t.amount || 0;
    });
    return stats;
  }, [transactions]);

  // Filter categories by type
  const filteredCategories = categories.filter(c => c.type === activeTab);

  // Format currency
  const formatCurrency = (amount) => {
    return `₱${(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Open form for adding
  const handleAdd = () => {
    setEditingCategory(null);
    setForm({ name: '', type: activeTab, icon: 'Tag', color: 'gray' });
    setErrors({});
    setShowForm(true);
  };

  // Open form for editing
  const handleEdit = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      type: category.type,
      icon: category.icon || 'Tag',
      color: category.color || 'gray',
    });
    setErrors({});
    setShowForm(true);
  };

  // Close form
  const handleClose = () => {
    setShowForm(false);
    setEditingCategory(null);
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
    if (!form.name.trim()) newErrors.name = 'Please enter a category name';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validate()) return;

    const data = {
      name: form.name.trim(),
      type: form.type,
      icon: form.icon,
      color: form.color,
    };

    if (editingCategory) {
      await onUpdate(editingCategory.id, data);
    } else {
      await onAdd(data);
    }
    handleClose();
  };

  // Handle delete
  const handleDelete = (category) => {
    const stats = categoryStats[category.id];
    if (stats && stats.count > 0) {
      alert(`Cannot delete: ${stats.count} transactions use this category.`);
      return;
    }
    if (category.isDefault) {
      alert('Cannot delete default categories.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this category?')) {
      onDelete(category.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Tag className="w-6 h-6" />
          Categories
        </h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'expense'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Expense Categories
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'income'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Income Categories
        </button>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => {
          const stats = categoryStats[category.id] || { count: 0, total: 0 };
          return (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${getColorClass(category.color)} flex items-center justify-center`}>
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stats.count} transactions
                    </p>
                  </div>
                </div>
                {!category.isDefault && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className={`text-lg font-semibold ${
                  category.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(stats.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total spent</p>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
          <Tag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No categories found</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Groceries"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => updateField('type', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => updateField('color', color.value)}
                      className={`w-8 h-8 rounded-full ${color.bg} ${
                        form.color === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
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

export default PersonalCategoryList;

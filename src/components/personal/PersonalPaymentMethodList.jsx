import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, CreditCard, Wallet, Smartphone, Building, X, Save } from 'lucide-react';

/**
 * Personal Payment Method List Component
 * Manages payment methods (cash, cards, e-wallets, banks)
 */
function PersonalPaymentMethodList({
  paymentMethods = [],
  transactions = [],
  onAdd,
  onUpdate,
  onDelete
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [form, setForm] = useState({
    name: '',
    type: 'cash',
    balance: '',
  });
  const [errors, setErrors] = useState({});

  // Type options with icons
  const typeOptions = [
    { value: 'cash', label: 'Cash', icon: Wallet },
    { value: 'card', label: 'Credit/Debit Card', icon: CreditCard },
    { value: 'ewallet', label: 'E-Wallet', icon: Smartphone },
    { value: 'bank', label: 'Bank Account', icon: Building },
  ];

  const getTypeIcon = (type) => {
    const option = typeOptions.find(t => t.value === type);
    return option ? option.icon : Wallet;
  };

  // Calculate payment method stats
  const methodStats = useMemo(() => {
    const stats = {};
    transactions.forEach(t => {
      const pmId = t.paymentMethodId;
      if (!pmId) return;
      if (!stats[pmId]) {
        stats[pmId] = { count: 0, expenses: 0, income: 0 };
      }
      stats[pmId].count += 1;
      if (t.type === 'expense') {
        stats[pmId].expenses += t.amount || 0;
      } else {
        stats[pmId].income += t.amount || 0;
      }
    });
    return stats;
  }, [transactions]);

  // Format currency
  const formatCurrency = (amount) => {
    return `₱${(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Open form for adding
  const handleAdd = () => {
    setEditingMethod(null);
    setForm({ name: '', type: 'cash', balance: '' });
    setErrors({});
    setShowForm(true);
  };

  // Open form for editing
  const handleEdit = (method) => {
    setEditingMethod(method);
    setForm({
      name: method.name,
      type: method.type || 'cash',
      balance: method.balance || '',
    });
    setErrors({});
    setShowForm(true);
  };

  // Close form
  const handleClose = () => {
    setShowForm(false);
    setEditingMethod(null);
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
    if (!form.name.trim()) newErrors.name = 'Please enter a name';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validate()) return;

    const data = {
      name: form.name.trim(),
      type: form.type,
      balance: parseFloat(form.balance) || 0,
    };

    if (editingMethod) {
      await onUpdate(editingMethod.id, data);
    } else {
      await onAdd(data);
    }
    handleClose();
  };

  // Handle delete
  const handleDelete = (method) => {
    const stats = methodStats[method.id];
    if (stats && stats.count > 0) {
      alert(`Cannot delete: ${stats.count} transactions use this payment method.`);
      return;
    }
    if (method.isDefault) {
      alert('Cannot delete default payment methods.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      onDelete(method.id);
    }
  };

  // Group by type
  const groupedMethods = useMemo(() => {
    const groups = {};
    typeOptions.forEach(type => {
      groups[type.value] = paymentMethods.filter(pm => pm.type === type.value);
    });
    return groups;
  }, [paymentMethods]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-6 h-6" />
          Payment Methods
        </h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Method
        </button>
      </div>

      {/* Payment Methods by Type */}
      {typeOptions.map((typeOption) => {
        const methods = groupedMethods[typeOption.value] || [];
        if (methods.length === 0) return null;

        const TypeIcon = typeOption.icon;

        return (
          <div key={typeOption.value} className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <TypeIcon className="w-4 h-4" />
              {typeOption.label}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {methods.map((method) => {
                const stats = methodStats[method.id] || { count: 0, expenses: 0, income: 0 };
                const Icon = getTypeIcon(method.type);

                return (
                  <div
                    key={method.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {method.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {stats.count} transactions
                          </p>
                        </div>
                      </div>
                      {!method.isDefault && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(method)}
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(method)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Total Spent</span>
                        <span className="text-red-600 dark:text-red-400">
                          {formatCurrency(stats.expenses)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Total Received</span>
                        <span className="text-green-600 dark:text-green-400">
                          {formatCurrency(stats.income)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {paymentMethods.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
          <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">No payment methods yet</p>
          <button onClick={handleAdd} className="text-blue-500 hover:text-blue-600">
            Add your first payment method
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
              </h3>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., My GCash"
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
                  {typeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Balance (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                  <input
                    type="number"
                    value={form.balance}
                    onChange={(e) => updateField('balance', e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Track your current balance (for reference only)
                </p>
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

export default PersonalPaymentMethodList;

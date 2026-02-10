import { useState } from 'react';
import { Plus, Edit2, Trash2, Target, TrendingUp, Calendar, X, Save, DollarSign } from 'lucide-react';

/**
 * Personal Goal List Component
 * Manages savings goals with progress tracking
 */
function PersonalGoalList({
  goals = [],
  totalSavings = 0,
  onAdd,
  onUpdate,
  onDelete,
  onAddFunds,
  onWithdraw
}) {
  const [showForm, setShowForm] = useState(false);
  const [showFundsModal, setShowFundsModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [fundsAmount, setFundsAmount] = useState('');
  const [fundsAction, setFundsAction] = useState('add');
  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    color: 'blue',
  });
  const [errors, setErrors] = useState({});

  // Format currency
  const formatCurrency = (amount) => {
    return `₱${(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Color options
  const colors = [
    { value: 'blue', bg: 'bg-blue-500', light: 'bg-blue-100' },
    { value: 'green', bg: 'bg-green-500', light: 'bg-green-100' },
    { value: 'purple', bg: 'bg-purple-500', light: 'bg-purple-100' },
    { value: 'pink', bg: 'bg-pink-500', light: 'bg-pink-100' },
    { value: 'orange', bg: 'bg-orange-500', light: 'bg-orange-100' },
    { value: 'teal', bg: 'bg-teal-500', light: 'bg-teal-100' },
  ];

  const getColorClass = (color) => {
    return colors.find(c => c.value === color)?.bg || 'bg-blue-500';
  };

  // Open form for adding
  const handleAdd = () => {
    setEditingGoal(null);
    setForm({ name: '', targetAmount: '', currentAmount: '', deadline: '', color: 'blue' });
    setErrors({});
    setShowForm(true);
  };

  // Open form for editing
  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setForm({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount || 0,
      deadline: goal.deadline || '',
      color: goal.color || 'blue',
    });
    setErrors({});
    setShowForm(true);
  };

  // Open funds modal
  const handleOpenFunds = (goal, action) => {
    setSelectedGoal(goal);
    setFundsAction(action);
    setFundsAmount('');
    setShowFundsModal(true);
  };

  // Close forms
  const handleClose = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleCloseFunds = () => {
    setShowFundsModal(false);
    setSelectedGoal(null);
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
    if (!form.name.trim()) newErrors.name = 'Please enter a goal name';
    if (!form.targetAmount || parseFloat(form.targetAmount) <= 0) {
      newErrors.targetAmount = 'Please enter a valid target amount';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validate()) return;

    const data = {
      name: form.name.trim(),
      targetAmount: parseFloat(form.targetAmount),
      currentAmount: parseFloat(form.currentAmount) || 0,
      deadline: form.deadline || null,
      color: form.color,
    };

    if (editingGoal) {
      await onUpdate(editingGoal.id, data);
    } else {
      await onAdd(data);
    }
    handleClose();
  };

  // Handle funds action
  const handleFundsAction = async () => {
    const amount = parseFloat(fundsAmount);
    if (!amount || amount <= 0) return;

    if (fundsAction === 'add') {
      await onAddFunds(selectedGoal.id, amount);
    } else {
      await onWithdraw(selectedGoal.id, amount);
    }
    handleCloseFunds();
  };

  // Handle delete
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      onDelete(id);
    }
  };

  const activeGoals = goals.filter(g => !g.isCompleted);
  const completedGoals = goals.filter(g => g.isCompleted);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6" />
            Savings Goals
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Saved: {formatCurrency(totalSavings)}
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Goals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getColorClass(goal.color)}`} />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {goal.name}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2 mb-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getColorClass(goal.color)}`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatCurrency(goal.currentAmount)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  <p className="text-center text-sm font-medium text-gray-900 dark:text-white">
                    {goal.progress.toFixed(0)}% Complete
                  </p>
                </div>

                {/* Deadline */}
                {goal.deadline && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <Calendar className="w-3 h-3" />
                    {goal.daysRemaining !== null && (
                      <span className={goal.isOverdue ? 'text-red-500' : ''}>
                        {goal.isOverdue
                          ? `${Math.abs(goal.daysRemaining)} days overdue`
                          : `${goal.daysRemaining} days remaining`
                        }
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenFunds(goal, 'add')}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 text-sm"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Add Funds
                  </button>
                  <button
                    onClick={() => handleOpenFunds(goal, 'withdraw')}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                  >
                    <DollarSign className="w-4 h-4" />
                    Withdraw
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Goals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-green-50 dark:bg-green-900/20 rounded-xl shadow p-4 border border-green-200 dark:border-green-800"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-300">
                      {goal.name}
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {formatCurrency(goal.targetAmount)} achieved!
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-1.5 text-green-400 hover:text-red-500 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
          <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">No savings goals yet</p>
          <button onClick={handleAdd} className="text-blue-500 hover:text-blue-600">
            Create your first goal
          </button>
        </div>
      )}

      {/* Goal Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingGoal ? 'Edit Goal' : 'Add Goal'}
              </h3>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Goal Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Emergency Fund"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                  <input
                    type="number"
                    value={form.targetAmount}
                    onChange={(e) => updateField('targetAmount', e.target.value)}
                    placeholder="0.00"
                    className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.targetAmount ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.targetAmount && <p className="text-red-500 text-xs mt-1">{errors.targetAmount}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                  <input
                    type="number"
                    value={form.currentAmount}
                    onChange={(e) => updateField('currentAmount', e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => updateField('deadline', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => updateField('color', color.value)}
                      className={`w-8 h-8 rounded-full ${color.bg} ${
                        form.color === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                      }`}
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

      {/* Funds Modal */}
      {showFundsModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {fundsAction === 'add' ? 'Add Funds' : 'Withdraw Funds'}
              </h3>
              <button onClick={handleCloseFunds} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {fundsAction === 'add' ? 'Add to' : 'Withdraw from'}: <strong>{selectedGoal.name}</strong>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Current: {formatCurrency(selectedGoal.currentAmount)}
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                <input
                  type="number"
                  value={fundsAmount}
                  onChange={(e) => setFundsAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t dark:border-gray-700">
              <button
                onClick={handleCloseFunds}
                className="flex-1 px-4 py-2 border dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleFundsAction}
                className={`flex-1 px-4 py-2 text-white rounded-lg ${
                  fundsAction === 'add' ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {fundsAction === 'add' ? 'Add' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonalGoalList;

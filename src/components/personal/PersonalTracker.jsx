import { useState } from 'react';
import {
  LayoutDashboard,
  ArrowUpDown,
  PiggyBank,
  Target,
  CreditCard,
  Repeat,
  FileText,
  Tag
} from 'lucide-react';

// Import hooks
import {
  usePersonalTransactions,
  usePersonalCategories,
  usePersonalBudgets,
  usePersonalGoals,
  usePersonalPaymentMethods,
  usePersonalRecurring,
  usePersonalDashboard,
} from '../../hooks/personal';

// Import components
import PersonalDashboard from './PersonalDashboard';
import PersonalTransactionList from './PersonalTransactionList';
import PersonalTransactionForm from './PersonalTransactionForm';
import PersonalBudgetList from './PersonalBudgetList';
import PersonalGoalList from './PersonalGoalList';
import PersonalCategoryList from './PersonalCategoryList';
import PersonalPaymentMethodList from './PersonalPaymentMethodList';
import PersonalRecurringList from './PersonalRecurringList';

/**
 * Personal Finance Tracker - Main Container
 * Manages all personal finance features
 */
function PersonalTracker() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Load all data with hooks
  const transactionsHook = usePersonalTransactions();
  const categoriesHook = usePersonalCategories();
  const paymentMethodsHook = usePersonalPaymentMethods();
  const goalsHook = usePersonalGoals();
  const budgetsHook = usePersonalBudgets(
    transactionsHook.transactions,
    categoriesHook.categories
  );
  const recurringHook = usePersonalRecurring(
    categoriesHook.categories,
    paymentMethodsHook.paymentMethods
  );
  const dashboardHook = usePersonalDashboard(
    transactionsHook.transactions,
    categoriesHook.categories,
    budgetsHook.budgets,
    goalsHook.goals
  );

  // Check if still loading
  const isLoading = transactionsHook.loading ||
                    categoriesHook.loading ||
                    paymentMethodsHook.loading;

  // Navigation tabs
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowUpDown },
    { id: 'budgets', label: 'Budgets', icon: PiggyBank },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'recurring', label: 'Recurring', icon: Repeat },
  ];

  // Handle adding new transaction
  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowTransactionForm(true);
  };

  // Handle editing transaction
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  // Handle closing form
  const handleCloseForm = () => {
    setShowTransactionForm(false);
    setEditingTransaction(null);
  };

  // Handle saving transaction
  const handleSaveTransaction = async (data) => {
    try {
      if (editingTransaction) {
        await transactionsHook.updateTransaction(editingTransaction.id, data);
      } else {
        await transactionsHook.addTransaction(data);
      }
      handleCloseForm();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <PersonalDashboard
            dashboard={dashboardHook}
            budgets={budgetsHook.budgets}
            goals={goalsHook.goals}
            onAddTransaction={handleAddTransaction}
          />
        );

      case 'transactions':
        return (
          <PersonalTransactionList
            transactions={transactionsHook.transactions}
            categories={categoriesHook.categories}
            paymentMethods={paymentMethodsHook.paymentMethods}
            onAdd={handleAddTransaction}
            onEdit={handleEditTransaction}
            onDelete={transactionsHook.deleteTransaction}
          />
        );

      case 'budgets':
        return (
          <PersonalBudgetList
            budgets={budgetsHook.budgets}
            categories={categoriesHook.expenseCategories}
            onAdd={budgetsHook.addBudget}
            onUpdate={budgetsHook.updateBudget}
            onDelete={budgetsHook.deleteBudget}
          />
        );

      case 'goals':
        return (
          <PersonalGoalList
            goals={goalsHook.goals}
            totalSavings={goalsHook.totalSavings}
            onAdd={goalsHook.addGoal}
            onUpdate={goalsHook.updateGoal}
            onDelete={goalsHook.deleteGoal}
            onAddFunds={goalsHook.addFunds}
            onWithdraw={goalsHook.withdrawFunds}
          />
        );

      case 'categories':
        return (
          <PersonalCategoryList
            categories={categoriesHook.categories}
            transactions={transactionsHook.transactions}
            onAdd={categoriesHook.addCategory}
            onUpdate={categoriesHook.updateCategory}
            onDelete={categoriesHook.deleteCategory}
          />
        );

      case 'payments':
        return (
          <PersonalPaymentMethodList
            paymentMethods={paymentMethodsHook.paymentMethods}
            transactions={transactionsHook.transactions}
            onAdd={paymentMethodsHook.addPaymentMethod}
            onUpdate={paymentMethodsHook.updatePaymentMethod}
            onDelete={paymentMethodsHook.deletePaymentMethod}
          />
        );

      case 'recurring':
        return (
          <PersonalRecurringList
            recurring={recurringHook.recurring}
            categories={categoriesHook.categories}
            paymentMethods={paymentMethodsHook.paymentMethods}
            onAdd={recurringHook.addRecurring}
            onUpdate={recurringHook.updateRecurring}
            onDelete={recurringHook.deleteRecurring}
            onToggleActive={recurringHook.toggleActive}
            onProcessDue={recurringHook.processDueTransactions}
            dueCount={recurringHook.dueItems.length}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <PersonalTransactionForm
          transaction={editingTransaction}
          categories={categoriesHook.categories}
          paymentMethods={paymentMethodsHook.paymentMethods}
          onSave={handleSaveTransaction}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

export default PersonalTracker;

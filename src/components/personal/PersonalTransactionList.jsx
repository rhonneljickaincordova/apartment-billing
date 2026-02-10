import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ChevronDown
} from 'lucide-react';
import SearchableSelect from './SearchableSelect';

/**
 * Personal Transaction List Component
 * Displays and manages personal transactions with filtering and sorting
 */
function PersonalTransactionList({
  transactions = [],
  categories = [],
  paymentMethods = [],
  onAdd,
  onEdit,
  onDelete
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Get category by ID
  const getCategoryById = (id) => categories.find(c => c.id === id);

  // Get payment method by ID
  const getPaymentMethodById = (id) => paymentMethods.find(p => p.id === id);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t =>
        t.description?.toLowerCase().includes(term) ||
        getCategoryById(t.categoryId)?.name?.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      result = result.filter(t => t.type === filterType);
    }

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter(t => t.categoryId === filterCategory);
    }

    // Date range filter
    if (filterDateRange !== 'all') {
      const now = new Date();
      let startDate;

      switch (filterDateRange) {
        case 'today':
          startDate = now.toISOString().split('T')[0];
          result = result.filter(t => t.date === startDate);
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
          result = result.filter(t => t.date >= startDate);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          result = result.filter(t => t.date >= startDate);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
          result = result.filter(t => t.date >= startDate);
          break;
      }
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = (getCategoryById(a.categoryId)?.name || '').localeCompare(
            getCategoryById(b.categoryId)?.name || ''
          );
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [transactions, searchTerm, filterType, filterCategory, filterDateRange, sortBy, sortOrder, categories]);

  // Calculate totals
  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    return { income, expenses, net: income - expenses };
  }, [filteredTransactions]);

  // Format currency
  const formatCurrency = (amount) => {
    return `₱${(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Handle delete with confirmation
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          Transactions
        </h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 sm:gap-2 bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Add</span>
          <span className="hidden sm:inline">Transaction</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t dark:border-gray-700">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="expense">Expenses</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
              <SearchableSelect
                options={[
                  { value: 'all', label: 'All Categories' },
                  ...categories.map(cat => ({
                    value: cat.id,
                    label: cat.name,
                    color: cat.color,
                  }))
                ]}
                value={filterCategory}
                onChange={(value) => setFilterCategory(value || 'all')}
                placeholder="All Categories"
                searchPlaceholder="Search categories..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date Range</label>
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Sort By</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  setSortBy(by);
                  setSortOrder(order);
                }}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="amount-desc">Amount (High to Low)</option>
                <option value="amount-asc">Amount (Low to High)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 sm:p-3 text-center">
          <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400">Income</p>
          <p className="text-sm sm:text-lg font-semibold text-green-700 dark:text-green-300 truncate">
            {formatCurrency(totals.income)}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 sm:p-3 text-center">
          <p className="text-[10px] sm:text-xs text-red-600 dark:text-red-400">Expenses</p>
          <p className="text-sm sm:text-lg font-semibold text-red-700 dark:text-red-300 truncate">
            {formatCurrency(totals.expenses)}
          </p>
        </div>
        <div className={`rounded-lg p-2 sm:p-3 text-center ${
          totals.net >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'
        }`}>
          <p className={`text-[10px] sm:text-xs ${totals.net >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
            Net
          </p>
          <p className={`text-sm sm:text-lg font-semibold truncate ${totals.net >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}`}>
            {totals.net < 0 && '-'}{formatCurrency(Math.abs(totals.net))}
          </p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredTransactions.map((tx) => {
              const category = getCategoryById(tx.categoryId);
              const paymentMethod = getPaymentMethodById(tx.paymentMethodId);

              return (
                <div
                  key={tx.id}
                  className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {tx.type === 'income' ? (
                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                            {tx.description || category?.name || 'Transaction'}
                          </p>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {tx.date}
                            </span>
                            {category && (
                              <span className="bg-gray-100 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 rounded truncate max-w-[80px] sm:max-w-none">
                                {category.name}
                              </span>
                            )}
                            {paymentMethod && (
                              <span className="hidden sm:inline bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                {paymentMethod.name}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Amount and Actions */}
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-3 flex-shrink-0">
                          <span className={`text-sm sm:text-lg font-semibold whitespace-nowrap ${
                            tx.type === 'income'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </span>

                          <div className="flex items-center">
                            <button
                              onClick={() => onEdit(tx)}
                              className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(tx.id)}
                              className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
            <button
              onClick={onAdd}
              className="mt-4 text-blue-500 hover:text-blue-600"
            >
              Add your first transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PersonalTransactionList;

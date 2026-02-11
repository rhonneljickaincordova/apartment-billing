import { useState, useMemo } from 'react';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Download
} from 'lucide-react';

/**
 * Personal Reports Component
 * Shows financial reports with date range filtering
 */
function PersonalReports({ transactions = [], categories = [] }) {
  const [dateRange, setDateRange] = useState('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Calculate date range
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    let start, end;

    switch (dateRange) {
      case 'week':
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        end = now;
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      case 'custom':
        start = customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1);
        end = customEnd ? new Date(customEnd) : now;
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  }, [dateRange, customStart, customEnd]);

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.date >= startDate && t.date <= endDate);
  }, [transactions, startDate, endDate]);

  // Calculate summary
  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      income,
      expenses,
      net: income - expenses,
      transactionCount: filteredTransactions.length
    };
  }, [filteredTransactions]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');
    const breakdown = {};

    expenseTransactions.forEach(t => {
      const catId = t.categoryId || 'uncategorized';
      if (!breakdown[catId]) {
        const category = categories.find(c => c.id === catId);
        breakdown[catId] = {
          categoryId: catId,
          name: category?.name || 'Uncategorized',
          color: category?.color || 'gray',
          amount: 0,
          count: 0
        };
      }
      breakdown[catId].amount += t.amount || 0;
      breakdown[catId].count += 1;
    });

    const sorted = Object.values(breakdown).sort((a, b) => b.amount - a.amount);
    const total = sorted.reduce((sum, cat) => sum + cat.amount, 0);

    return sorted.map(cat => ({
      ...cat,
      percentage: total > 0 ? (cat.amount / total) * 100 : 0
    }));
  }, [filteredTransactions, categories]);

  // Income breakdown
  const incomeBreakdown = useMemo(() => {
    const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
    const breakdown = {};

    incomeTransactions.forEach(t => {
      const catId = t.categoryId || 'uncategorized';
      if (!breakdown[catId]) {
        const category = categories.find(c => c.id === catId);
        breakdown[catId] = {
          categoryId: catId,
          name: category?.name || 'Uncategorized',
          color: category?.color || 'gray',
          amount: 0,
          count: 0
        };
      }
      breakdown[catId].amount += t.amount || 0;
      breakdown[catId].count += 1;
    });

    const sorted = Object.values(breakdown).sort((a, b) => b.amount - a.amount);
    const total = sorted.reduce((sum, cat) => sum + cat.amount, 0);

    return sorted.map(cat => ({
      ...cat,
      percentage: total > 0 ? (cat.amount / total) * 100 : 0
    }));
  }, [filteredTransactions, categories]);

  // Format currency
  const formatCurrency = (amount) => {
    return `₱${Math.abs(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Color mapping
  const colorMap = {
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    red: 'bg-red-500',
    teal: 'bg-teal-500',
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    cyan: 'bg-cyan-500',
    emerald: 'bg-emerald-500',
    gray: 'bg-gray-500',
    slate: 'bg-slate-500',
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = filteredTransactions.map(t => {
      const category = categories.find(c => c.id === t.categoryId);
      return [
        t.date,
        t.type,
        category?.name || 'Uncategorized',
        t.description || '',
        t.amount
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${startDate}_to_${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          Reports
        </h2>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <div className="flex flex-wrap gap-2">
            {['week', 'month', 'year', 'custom'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {range === 'week' && 'This Week'}
                {range === 'month' && 'This Month'}
                {range === 'year' && 'This Year'}
                {range === 'custom' && 'Custom'}
              </button>
            ))}
          </div>
        </div>

        {dateRange === 'custom' && (
          <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t dark:border-gray-700">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs text-green-600 dark:text-green-400">Income</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-green-700 dark:text-green-300">
            {formatCurrency(summary.income)}
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-xs text-red-600 dark:text-red-400">Expenses</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-red-700 dark:text-red-300">
            {formatCurrency(summary.expenses)}
          </p>
        </div>

        <div className={`rounded-lg p-3 sm:p-4 ${
          summary.net >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            {summary.net >= 0 ? (
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            )}
            <span className={`text-xs ${
              summary.net >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'
            }`}>Net</span>
          </div>
          <p className={`text-lg sm:text-xl font-bold ${
            summary.net >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'
          }`}>
            {summary.net < 0 && '-'}{formatCurrency(summary.net)}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4">
          <span className="text-xs text-gray-600 dark:text-gray-400">Transactions</span>
          <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mt-1">
            {summary.transactionCount}
          </p>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Expense Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Expense by Category
          </h3>
          {categoryBreakdown.length > 0 ? (
            <div className="space-y-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.categoryId} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${colorMap[cat.color] || 'bg-gray-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {cat.name}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                        {formatCurrency(cat.amount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colorMap[cat.color] || 'bg-gray-500'}`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                    {cat.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm">
              No expenses in this period
            </p>
          )}
        </div>

        {/* Income Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Income by Category
          </h3>
          {incomeBreakdown.length > 0 ? (
            <div className="space-y-3">
              {incomeBreakdown.map((cat) => (
                <div key={cat.categoryId} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${colorMap[cat.color] || 'bg-gray-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {cat.name}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                        {formatCurrency(cat.amount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colorMap[cat.color] || 'bg-gray-500'}`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                    {cat.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm">
              No income in this period
            </p>
          )}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Transaction Details
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Description</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredTransactions.length > 0 ? (
                filteredTransactions
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 50)
                  .map((tx) => {
                    const category = categories.find(c => c.id === tx.categoryId);
                    return (
                      <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">
                          {tx.date}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {category?.name || 'Uncategorized'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell truncate max-w-[200px]">
                          {tx.description || '-'}
                        </td>
                        <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${
                          tx.type === 'income'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No transactions in this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredTransactions.length > 50 && (
          <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700">
            Showing 50 of {filteredTransactions.length} transactions
          </div>
        )}
      </div>
    </div>
  );
}

export default PersonalReports;

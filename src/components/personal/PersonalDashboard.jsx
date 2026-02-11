import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

/**
 * Personal Dashboard Component
 * Shows financial overview with summary cards, charts, and recent activity
 */
function PersonalDashboard({ dashboard, onAddTransaction }) {
  const {
    monthlySummary,
    categoryBreakdown,
    recentTransactions,
    monthlyTrend,
    dailyAverageSpending,
  } = dashboard;

  // Format currency
  const formatCurrency = (amount) => {
    return `₱${Math.abs(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Summary cards data
  const summaryCards = [
    {
      title: 'Monthly Income',
      value: monthlySummary.totalIncome,
      icon: TrendingUp,
      bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
      iconBg: 'bg-green-400/30',
    },
    {
      title: 'Monthly Expenses',
      value: monthlySummary.totalExpenses,
      icon: TrendingDown,
      bgColor: 'bg-gradient-to-br from-red-500 to-rose-600',
      iconBg: 'bg-red-400/30',
    },
    {
      title: 'Net Balance',
      value: monthlySummary.netBalance,
      icon: Wallet,
      bgColor: monthlySummary.netBalance >= 0
        ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
        : 'bg-gradient-to-br from-orange-500 to-red-600',
      iconBg: 'bg-blue-400/30',
    },
  ];

  // Color mapping for categories
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

  return (
    <div className="space-y-6">
      {/* Quick Action Button */}
      <div className="flex justify-end">
        <button
          onClick={onAddTransaction}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`${card.bgColor} rounded-xl shadow-lg p-4 md:p-5 text-white`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-xs md:text-sm font-medium">{card.title}</p>
                  <p className="text-xl md:text-2xl font-bold mt-1">
                    {card.value < 0 && '-'}{formatCurrency(card.value)}
                  </p>
                </div>
                <div className={`${card.iconBg} p-2 md:p-3 rounded-xl`}>
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Expense by Category
        </h3>
        {categoryBreakdown.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categoryBreakdown.slice(0, 8).map((cat) => (
              <div key={cat.categoryId} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${colorMap[cat.color] || 'bg-gray-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {cat.name}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
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
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No expenses this month
          </p>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Transactions
        </h3>
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    tx.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {tx.type === 'income' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {tx.description || tx.categoryName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {tx.date} • {tx.categoryName}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${
                  tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No transactions yet
          </p>
        )}
      </div>

      {/* Monthly Trend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Monthly Trend (Last 6 Months)
        </h3>
        <div className="grid grid-cols-6 gap-2">
          {monthlyTrend.map((month, index) => {
            const maxValue = Math.max(
              ...monthlyTrend.map(m => Math.max(m.income, m.expenses))
            ) || 1;
            const incomeHeight = (month.income / maxValue) * 100;
            const expenseHeight = (month.expenses / maxValue) * 100;

            return (
              <div key={index} className="text-center">
                <div className="h-24 flex items-end justify-center gap-1 mb-2">
                  <div
                    className="w-3 bg-green-500 rounded-t"
                    style={{ height: `${incomeHeight}%`, minHeight: month.income > 0 ? '4px' : '0' }}
                    title={`Income: ${formatCurrency(month.income)}`}
                  />
                  <div
                    className="w-3 bg-red-500 rounded-t"
                    style={{ height: `${expenseHeight}%`, minHeight: month.expenses > 0 ? '4px' : '0' }}
                    title={`Expenses: ${formatCurrency(month.expenses)}`}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{month.month}</p>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Expenses</span>
          </div>
        </div>
      </div>

      {/* Daily Stats */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow p-4 md:p-6 text-white">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-white/70 text-sm">Daily Average Spending</p>
            <p className="text-xl font-bold">{formatCurrency(dailyAverageSpending)}</p>
          </div>
          <div>
            <p className="text-white/70 text-sm">Transactions This Month</p>
            <p className="text-xl font-bold">{monthlySummary.transactionCount}</p>
          </div>
          <div>
            <p className="text-white/70 text-sm">Savings Rate</p>
            <p className="text-xl font-bold">{monthlySummary.savingsRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonalDashboard;

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus, BarChart3 } from 'lucide-react';

/**
 * Monthly Comparison Component
 * Compares current month vs last month for revenue, expenses, and profit
 */
function MonthlyComparison({ bills, expenses, getBillTotal }) {
  const comparisonData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate last month
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Filter bills for current month
    const currentMonthBills = bills.filter((bill) => {
      const date = new Date(bill.dueDate);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    // Filter bills for last month
    const lastMonthBills = bills.filter((bill) => {
      const date = new Date(bill.dueDate);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    // Filter expenses for current month
    const currentMonthExpenses = expenses.filter((expense) => {
      const date = new Date(expense.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    // Filter expenses for last month
    const lastMonthExpenses = expenses.filter((expense) => {
      const date = new Date(expense.date);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    // Helper function to calculate cash collected (separates deposits from actual cash)
    const calculateCashCollected = (billsArray) => {
      let cashCollected = 0;
      let refundsGiven = 0;

      billsArray.forEach((bill) => {
        const amountPaid = bill.amountPaid || 0;

        if (bill.depositApplied && bill.depositAmount > 0) {
          // Bill has deposit applied - only count cash portion
          const depositUsed = bill.depositAmount;
          const billTotal = getBillTotal(bill, bill.rentExcluded || false);

          // Cash portion = total paid minus deposit
          const cashPortion = Math.max(0, amountPaid - depositUsed);
          cashCollected += cashPortion;

          // Refund = deposit exceeds bill total (money returned to tenant)
          if (depositUsed > billTotal) {
            refundsGiven += depositUsed - billTotal;
          }
        } else {
          // No deposit - all payments are cash
          cashCollected += amountPaid;
        }
      });

      return { cashCollected, refundsGiven };
    };

    // Calculate totals for current month
    const currentRevenue = currentMonthBills.reduce((sum, b) => sum + getBillTotal(b, b.rentExcluded || false), 0);
    const currentApartmentExpenses = currentMonthExpenses.filter((e) => (e.expenseType || 'apartment') === 'apartment');
    const currentExpenseTotal = currentMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const currentApartmentExpenseTotal = currentApartmentExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const { cashCollected: currentCashCollected, refundsGiven: currentRefunds } = calculateCashCollected(currentMonthBills);
    const currentProfit = currentCashCollected - currentApartmentExpenseTotal - currentRefunds;

    // Calculate totals for last month
    const lastRevenue = lastMonthBills.reduce((sum, b) => sum + getBillTotal(b, b.rentExcluded || false), 0);
    const lastApartmentExpenses = lastMonthExpenses.filter((e) => (e.expenseType || 'apartment') === 'apartment');
    const lastExpenseTotal = lastMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const lastApartmentExpenseTotal = lastApartmentExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const { cashCollected: lastCashCollected, refundsGiven: lastRefunds } = calculateCashCollected(lastMonthBills);
    const lastProfit = lastCashCollected - lastApartmentExpenseTotal - lastRefunds;

    // Calculate percentage changes
    const revenueChange = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;
    const expenseChange = lastExpenseTotal > 0 ? ((currentExpenseTotal - lastExpenseTotal) / lastExpenseTotal) * 100 : 0;
    const profitChange = lastProfit !== 0 ? ((currentProfit - lastProfit) / Math.abs(lastProfit)) * 100 : 0;

    // Month names
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return {
      currentMonth: months[currentMonth],
      lastMonth: months[lastMonth],
      current: {
        revenue: currentRevenue,
        collected: currentCashCollected,
        expenses: currentExpenseTotal,
        profit: currentProfit,
      },
      last: {
        revenue: lastRevenue,
        collected: lastCashCollected,
        expenses: lastExpenseTotal,
        profit: lastProfit,
      },
      changes: {
        revenue: revenueChange,
        expenses: expenseChange,
        profit: profitChange,
      },
    };
  }, [bills, expenses, getBillTotal]);

  const formatCurrency = (value) => {
    return `₱${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatChange = (value) => {
    if (Math.abs(value) < 0.1) return '0%';
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getChangeIcon = (value, invertColors = false) => {
    if (Math.abs(value) < 0.1) return <Minus className="w-3 h-3" />;
    if (invertColors) {
      // For expenses, down is good
      return value > 0
        ? <ArrowUpRight className="w-3 h-3" />
        : <ArrowDownRight className="w-3 h-3" />;
    }
    return value > 0
      ? <ArrowUpRight className="w-3 h-3" />
      : <ArrowDownRight className="w-3 h-3" />;
  };

  const getChangeColor = (value, invertColors = false) => {
    if (Math.abs(value) < 0.1) return 'text-gray-500';
    if (invertColors) {
      // For expenses, down is good (green), up is bad (red)
      return value > 0 ? 'text-red-500' : 'text-green-500';
    }
    return value > 0 ? 'text-green-500' : 'text-red-500';
  };

  const metrics = [
    {
      label: 'Revenue',
      current: comparisonData.current.revenue,
      last: comparisonData.last.revenue,
      change: comparisonData.changes.revenue,
      icon: TrendingUp,
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
      invertColors: false,
    },
    {
      label: 'Expenses',
      current: comparisonData.current.expenses,
      last: comparisonData.last.expenses,
      change: comparisonData.changes.expenses,
      icon: TrendingDown,
      iconBg: 'bg-red-100 dark:bg-red-900/50',
      iconColor: 'text-red-600 dark:text-red-400',
      invertColors: true, // Lower expenses is better
    },
    {
      label: 'Profit',
      current: comparisonData.current.profit,
      last: comparisonData.last.profit,
      change: comparisonData.changes.profit,
      icon: BarChart3,
      iconBg: comparisonData.current.profit >= 0 ? 'bg-green-100 dark:bg-green-900/50' : 'bg-orange-100 dark:bg-orange-900/50',
      iconColor: comparisonData.current.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400',
      invertColors: false,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Monthly Comparison
        </h2>
        <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
          {comparisonData.currentMonth} vs {comparisonData.lastMonth}
        </span>
      </div>

      <div className="space-y-3 md:space-y-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
            >
              <div className={`p-2 md:p-3 rounded-lg ${metric.iconBg}`}>
                <Icon className={`w-4 h-4 md:w-5 md:h-5 ${metric.iconColor}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {metric.label}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className={`text-base md:text-lg font-bold truncate ${
                    metric.label === 'Profit' && metric.current < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {metric.label === 'Profit' && metric.current < 0 ? '-' : ''}
                    {formatCurrency(metric.current)}
                  </p>
                  <span className={`flex items-center gap-0.5 text-xs md:text-sm font-medium ${getChangeColor(metric.change, metric.invertColors)}`}>
                    {getChangeIcon(metric.change, metric.invertColors)}
                    {formatChange(metric.change)}
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500">
                  {comparisonData.lastMonth}
                </p>
                <p className={`text-xs md:text-sm font-medium ${
                  metric.label === 'Profit' && metric.last < 0
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {metric.label === 'Profit' && metric.last < 0 ? '-' : ''}
                  {formatCurrency(metric.last)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MonthlyComparison;

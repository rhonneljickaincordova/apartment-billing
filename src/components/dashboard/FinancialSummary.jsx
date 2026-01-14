import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

/**
 * Financial Summary Component
 * Displays Gross Revenue, Expenses, and Profit based on filtered data
 */
function FinancialSummary({ bills, expenses, getBillTotal }) {
  const financialData = useMemo(() => {
    // Calculate gross revenue (all bills - both paid and unpaid)
    const grossRevenue = bills.reduce((sum, bill) => sum + getBillTotal(bill), 0);

    // Calculate collected revenue (only paid bills)
    const collectedRevenue = bills
      .filter((bill) => bill.paid)
      .reduce((sum, bill) => sum + getBillTotal(bill), 0);

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    // Calculate profit (collected revenue - expenses)
    const profit = collectedRevenue - totalExpenses;

    // Calculate projected profit (gross - expenses)
    const projectedProfit = grossRevenue - totalExpenses;

    return {
      grossRevenue,
      collectedRevenue,
      totalExpenses,
      profit,
      projectedProfit,
      billCount: bills.length,
      expenseCount: expenses.length,
    };
  }, [bills, expenses, getBillTotal]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-6">
        <DollarSign className="w-5 h-5" />
        Financial Summary
      </h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Gross Revenue */}
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Gross Revenue</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                ₱{financialData.grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                {financialData.billCount} bill{financialData.billCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                ₱{financialData.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                {financialData.expenseCount} expense{financialData.expenseCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="bg-red-100 dark:bg-red-800 p-3 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-300" />
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className={`rounded-lg p-4 ${
          financialData.profit >= 0
            ? 'bg-green-50 dark:bg-green-900/30'
            : 'bg-orange-50 dark:bg-orange-900/30'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                financialData.profit >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                Net Profit
              </p>
              <p className={`text-2xl font-bold ${
                financialData.profit >= 0
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-orange-700 dark:text-orange-300'
              }`}>
                ₱{financialData.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className={`text-xs mt-1 ${
                financialData.profit >= 0
                  ? 'text-green-500 dark:text-green-400'
                  : 'text-orange-500 dark:text-orange-400'
              }`}>
                Based on collected
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              financialData.profit >= 0
                ? 'bg-green-100 dark:bg-green-800'
                : 'bg-orange-100 dark:bg-orange-800'
            }`}>
              <DollarSign className={`w-6 h-6 ${
                financialData.profit >= 0
                  ? 'text-green-600 dark:text-green-300'
                  : 'text-orange-600 dark:text-orange-300'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="border-t dark:border-gray-700 pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Collected</p>
            <p className="font-semibold text-gray-800 dark:text-white">
              ₱{financialData.collectedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Pending</p>
            <p className="font-semibold text-yellow-600 dark:text-yellow-400">
              ₱{(financialData.grossRevenue - financialData.collectedRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Projected Profit</p>
            <p className={`font-semibold ${
              financialData.projectedProfit >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              ₱{financialData.projectedProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Profit Margin</p>
            <p className={`font-semibold ${
              financialData.grossRevenue > 0 && (financialData.profit / financialData.grossRevenue) >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {financialData.grossRevenue > 0
                ? `${((financialData.profit / financialData.grossRevenue) * 100).toFixed(1)}%`
                : '0%'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinancialSummary;

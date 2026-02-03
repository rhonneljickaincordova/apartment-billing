import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Building2, User } from 'lucide-react';

/**
 * Financial Summary Component
 * Displays Gross Revenue, Expenses, and Profit based on filtered data
 */
function FinancialSummary({ bills, expenses, getBillTotal }) {
  const financialData = useMemo(() => {
    // Calculate gross revenue (all bills - both paid and unpaid)
    const grossRevenue = bills.reduce((sum, bill) => sum + getBillTotal(bill, bill.rentExcluded || false), 0);

    // Separate paid bills into cash payments vs deposit settlements
    const paidBills = bills.filter((bill) => bill.paid);

    // Cash Collected: Actual money received (not deposit settlements)
    const cashCollected = paidBills
      .filter((bill) => !(bill.depositApplied && bill.depositAmount > 0))
      .reduce((sum, bill) => sum + getBillTotal(bill, bill.rentExcluded || false), 0);

    // Deposits Applied: Bills settled via deposit (no actual cash received)
    const depositsApplied = paidBills
      .filter((bill) => bill.depositApplied && bill.depositAmount > 0)
      .reduce((sum, bill) => sum + getBillTotal(bill, bill.rentExcluded || false), 0);

    // Total Settled: Sum of both (for reference)
    const collectedRevenue = cashCollected + depositsApplied;

    // Separate expenses by type
    const apartmentExpenses = expenses.filter((e) => (e.expenseType || 'apartment') === 'apartment');
    const personalExpenses = expenses.filter((e) => e.expenseType === 'personal');

    const totalApartmentExpenses = apartmentExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalPersonalExpenses = personalExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    // Calculate profit using only actual CASH collected (exclude deposit settlements)
    // This gives accurate cash flow picture
    const profit = cashCollected - totalApartmentExpenses;

    // Calculate projected profit (gross - apartment expenses)
    const projectedProfit = grossRevenue - totalApartmentExpenses;

    return {
      grossRevenue,
      collectedRevenue,
      cashCollected,
      depositsApplied,
      totalExpenses,
      totalApartmentExpenses,
      totalPersonalExpenses,
      apartmentExpenseCount: apartmentExpenses.length,
      personalExpenseCount: personalExpenses.length,
      profit,
      projectedProfit,
      billCount: bills.length,
      expenseCount: expenses.length,
    };
  }, [bills, expenses, getBillTotal]);

  const formatCurrency = (value) => {
    return `₱${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4 md:mb-6">
        <DollarSign className="w-5 h-5 text-blue-500" />
        Financial Summary
      </h3>

      {/* Summary Cards - Clean layout without overlapping icons */}
      <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
        {/* Gross Revenue */}
        <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white">
          <div className="p-2 md:p-3 bg-white/20 rounded-lg">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-blue-100 font-medium">Gross Revenue</p>
            <p className="text-lg md:text-2xl font-bold truncate">{formatCurrency(financialData.grossRevenue)}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs md:text-sm text-blue-100">{financialData.billCount} bills</p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl text-white">
          <div className="p-2 md:p-3 bg-white/20 rounded-lg">
            <TrendingDown className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-red-100 font-medium">Total Expenses</p>
            <p className="text-lg md:text-2xl font-bold truncate">{formatCurrency(financialData.totalExpenses)}</p>
            <div className="flex flex-wrap gap-2 md:gap-3 mt-1">
              <span className="inline-flex items-center gap-1 text-[10px] md:text-xs text-red-100">
                <Building2 className="w-3 h-3" />
                Apartment: {formatCurrency(financialData.totalApartmentExpenses)}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] md:text-xs text-red-100">
                <User className="w-3 h-3" />
                Personal: {formatCurrency(financialData.totalPersonalExpenses)}
              </span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs md:text-sm text-red-100">{financialData.expenseCount} expenses</p>
          </div>
        </div>

        {/* Net Profit */}
        <div className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl text-white ${
          financialData.profit >= 0
            ? 'bg-gradient-to-r from-emerald-500 to-green-600'
            : 'bg-gradient-to-r from-orange-500 to-amber-600'
        }`}>
          <div className="p-2 md:p-3 bg-white/20 rounded-lg">
            <PiggyBank className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs md:text-sm font-medium ${financialData.profit >= 0 ? 'text-green-100' : 'text-orange-100'}`}>
              Net Profit
            </p>
            <p className="text-lg md:text-2xl font-bold truncate">{formatCurrency(financialData.profit)}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className={`text-xs md:text-sm ${financialData.profit >= 0 ? 'text-green-100' : 'text-orange-100'}`}>
              Cash only
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown - Cash vs Deposits */}
      <div className="border-t dark:border-gray-700 pt-3 md:pt-4">
        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-2">Revenue Breakdown</p>
        <div className="grid grid-cols-3 gap-2 text-sm mb-3">
          <div className="text-center p-2 md:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-green-600 dark:text-green-400 text-[10px] md:text-xs mb-1">Cash Collected</p>
            <p className="font-bold text-xs md:text-sm text-green-700 dark:text-green-300 truncate">
              {formatCurrency(financialData.cashCollected)}
            </p>
          </div>
          <div className="text-center p-2 md:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-purple-600 dark:text-purple-400 text-[10px] md:text-xs mb-1">Deposits Applied</p>
            <p className="font-bold text-xs md:text-sm text-purple-700 dark:text-purple-300 truncate">
              {formatCurrency(financialData.depositsApplied)}
            </p>
          </div>
          <div className="text-center p-2 md:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 text-[10px] md:text-xs mb-1">Total Settled</p>
            <p className="font-bold text-xs md:text-sm text-gray-800 dark:text-white truncate">
              {formatCurrency(financialData.collectedRevenue)}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="border-t dark:border-gray-700 pt-3 md:pt-4">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 text-sm">
          <div className="text-center p-2 md:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 text-[10px] md:text-xs mb-1">Pending</p>
            <p className="font-bold text-xs md:text-sm text-amber-600 dark:text-amber-400 truncate">
              {formatCurrency(financialData.grossRevenue - financialData.collectedRevenue)}
            </p>
          </div>
          <div className="text-center p-2 md:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 text-[10px] md:text-xs mb-1">Projected Profit</p>
            <p className={`font-bold text-xs md:text-sm truncate ${
              financialData.projectedProfit >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(financialData.projectedProfit)}
            </p>
          </div>
          <div className="text-center p-2 md:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg col-span-2 md:col-span-1">
            <p className="text-gray-500 dark:text-gray-400 text-[10px] md:text-xs mb-1">Cash Margin</p>
            <p className={`font-bold text-xs md:text-sm ${
              financialData.cashCollected > 0 && (financialData.profit / financialData.cashCollected) >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {financialData.cashCollected > 0
                ? `${((financialData.profit / financialData.cashCollected) * 100).toFixed(1)}%`
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

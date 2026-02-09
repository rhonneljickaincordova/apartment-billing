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

    // Calculate cash collected and deposits applied separately
    // For bills with deposits: cash = amountPaid - depositAmount, deposit = depositAmount
    // For bills without deposits: cash = amountPaid, deposit = 0
    let cashCollected = 0;
    let depositsApplied = 0;
    let refundsGiven = 0;

    bills.forEach((bill) => {
      const amountPaid = bill.amountPaid || 0;

      if (bill.depositApplied && bill.depositAmount > 0) {
        // Bill has deposit applied
        const depositUsed = bill.depositAmount;
        const billTotal = getBillTotal(bill, bill.rentExcluded || false);

        // Deposit portion (capped at bill total to avoid double counting)
        const depositPortion = Math.min(depositUsed, billTotal);
        depositsApplied += depositPortion;

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

    // Total Settled: Sum of cash + deposit portions
    const collectedRevenue = cashCollected + depositsApplied;

    // Separate expenses by type
    const apartmentExpenses = expenses.filter((e) => (e.expenseType || 'apartment') === 'apartment');
    const personalExpenses = expenses.filter((e) => e.expenseType === 'personal');

    const totalApartmentExpenses = apartmentExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalPersonalExpenses = personalExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    // Main Net Profit = Gross Revenue - Total Expenses (apartment + personal)
    const profit = grossRevenue - totalExpenses;

    // Apartment-only profit (excluding personal expenses)
    const apartmentOnlyProfit = grossRevenue - totalApartmentExpenses;

    // Cash on Hand = Cash Collected - Apartment Expenses - Refunds (actual cash you're holding)
    const cashOnHand = cashCollected - totalApartmentExpenses - refundsGiven;

    return {
      grossRevenue,
      collectedRevenue,
      cashCollected,
      depositsApplied,
      refundsGiven,
      totalExpenses,
      totalApartmentExpenses,
      totalPersonalExpenses,
      apartmentExpenseCount: apartmentExpenses.length,
      personalExpenseCount: personalExpenses.length,
      profit,
      apartmentOnlyProfit,
      cashOnHand,
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
            {financialData.totalPersonalExpenses > 0 && (
              <p className={`text-[10px] md:text-xs mt-0.5 ${financialData.profit >= 0 ? 'text-green-100/80' : 'text-orange-100/80'}`}>
                Without Personal: {formatCurrency(financialData.apartmentOnlyProfit)}
              </p>
            )}
            <p className={`text-[10px] md:text-xs mt-0.5 ${financialData.profit >= 0 ? 'text-green-100/80' : 'text-orange-100/80'}`}>
              Cash on Hand: {formatCurrency(financialData.cashOnHand)}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className={`text-[10px] md:text-xs ${financialData.profit >= 0 ? 'text-green-100' : 'text-orange-100'}`}>
              Revenue - Expenses
            </p>
          </div>
        </div>
      </div>

      {/* Profit Calculation Breakdown */}
      <div className="border-t dark:border-gray-700 pt-3 md:pt-4">
        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-2">Profit Calculation</p>
        <div className="space-y-2 text-xs">
          {/* Revenue */}
          <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-blue-700 dark:text-blue-300">Gross Revenue</span>
            <span className="font-bold text-blue-700 dark:text-blue-300">
              {formatCurrency(financialData.grossRevenue)}
            </span>
          </div>
          {/* Expenses Breakdown */}
          <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex flex-col">
              <span className="text-red-700 dark:text-red-300">(-) Total Expenses</span>
              <span className="text-[10px] text-red-500 dark:text-red-400">
                Apt: {formatCurrency(financialData.totalApartmentExpenses)} + Personal: {formatCurrency(financialData.totalPersonalExpenses)}
              </span>
            </div>
            <span className="font-bold text-red-700 dark:text-red-300">
              {formatCurrency(financialData.totalExpenses)}
            </span>
          </div>
          {/* Net Profit Result */}
          <div className={`flex justify-between items-center p-2 rounded-lg ${
            financialData.profit >= 0
              ? 'bg-green-50 dark:bg-green-900/20'
              : 'bg-orange-50 dark:bg-orange-900/20'
          }`}>
            <span className={financialData.profit >= 0 ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}>
              = Net Profit
            </span>
            <span className={`font-bold ${financialData.profit >= 0 ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}`}>
              {formatCurrency(financialData.profit)}
            </span>
          </div>
        </div>
      </div>

      {/* Cash on Hand */}
      <div className="border-t dark:border-gray-700 pt-3 md:pt-4">
        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-2">Cash on Hand</p>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <span className="text-green-700 dark:text-green-300">Cash Collected</span>
            <span className="font-bold text-green-700 dark:text-green-300">
              {formatCurrency(financialData.cashCollected)}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <span className="text-red-700 dark:text-red-300">(-) Apartment Expenses</span>
            <span className="font-bold text-red-700 dark:text-red-300">
              {formatCurrency(financialData.totalApartmentExpenses)}
            </span>
          </div>
          {financialData.refundsGiven > 0 && (
            <div className="flex justify-between items-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <span className="text-orange-700 dark:text-orange-300">(-) Refunds Given</span>
              <span className="font-bold text-orange-700 dark:text-orange-300">
                {formatCurrency(financialData.refundsGiven)}
              </span>
            </div>
          )}
          <div className={`flex justify-between items-center p-2 rounded-lg ${
            financialData.cashOnHand >= 0
              ? 'bg-emerald-50 dark:bg-emerald-900/20'
              : 'bg-red-50 dark:bg-red-900/20'
          }`}>
            <span className={`font-medium ${financialData.cashOnHand >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
              = Cash on Hand
            </span>
            <span className={`font-bold ${financialData.cashOnHand >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
              {formatCurrency(financialData.cashOnHand)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinancialSummary;

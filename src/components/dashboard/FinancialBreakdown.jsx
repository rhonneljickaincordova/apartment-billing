import { useMemo } from 'react';
import { FileText, TrendingUp, TrendingDown, Calculator, Building2, User } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../../hooks/useExpenses';

/**
 * Get category label from value
 */
const getCategoryLabel = (value) => {
  const category = EXPENSE_CATEGORIES.find((c) => c.value === value);
  return category?.label || value;
};

/**
 * Financial Breakdown Component
 * Displays detailed audit breakdown for Gross Revenue, Expenses, and Net Profit
 */
function FinancialBreakdown({ bills, expenses, getBillTotal, getRoomById }) {
  const breakdownData = useMemo(() => {
    // Revenue breakdown by bill component
    const revenueBreakdown = {
      rent: 0,
      electricity: 0,
      water: 0,
      wifi: 0,
      airconCleaning: 0,
      penalty: 0,
      other: 0,
    };

    bills.forEach((bill) => {
      if (!bill.rentExcluded) {
        revenueBreakdown.rent += bill.rentBill || 0;
      }
      revenueBreakdown.electricity += bill.electricityBill || 0;
      revenueBreakdown.water += bill.waterBill || 0;
      revenueBreakdown.wifi += bill.wifiBill || 0;
      revenueBreakdown.airconCleaning += bill.airconCleaningBill || 0;
      if (bill.penaltyApplied && bill.penaltyAmount > 0) {
        revenueBreakdown.penalty += bill.penaltyAmount;
      }
      revenueBreakdown.other += bill.otherBill || 0;
    });

    const grossRevenue = Object.values(revenueBreakdown).reduce((sum, val) => sum + val, 0);

    // Expense breakdown by category
    const expensesByCategory = {};
    const apartmentExpenses = expenses.filter((e) => (e.expenseType || 'apartment') === 'apartment');
    const personalExpenses = expenses.filter((e) => e.expenseType === 'personal');

    apartmentExpenses.forEach((expense) => {
      const category = expense.category || 'other';
      if (!expensesByCategory[category]) {
        expensesByCategory[category] = { amount: 0, count: 0 };
      }
      expensesByCategory[category].amount += expense.amount || 0;
      expensesByCategory[category].count += 1;
    });

    const totalApartmentExpenses = apartmentExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalPersonalExpenses = personalExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalExpenses = totalApartmentExpenses + totalPersonalExpenses;

    // Calculate cash collected and deposits applied separately
    // For bills with deposits: cash = amountPaid - depositAmount, deposit = depositAmount
    // For bills without deposits: cash = amountPaid, deposit = 0
    let cashCollected = 0;
    let depositsApplied = 0;
    let refundsGiven = 0;
    let paidBillCount = 0;

    bills.forEach((bill) => {
      const amountPaid = bill.amountPaid || 0;
      if (amountPaid > 0 || bill.paid) paidBillCount++;

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

    // Main Net Profit = Gross Revenue - Total Expenses (apartment + personal)
    const netProfit = grossRevenue - totalExpenses;

    // Apartment-only profit (excluding personal expenses)
    const apartmentOnlyProfit = grossRevenue - totalApartmentExpenses;

    return {
      revenueBreakdown,
      grossRevenue,
      expensesByCategory,
      totalApartmentExpenses,
      totalPersonalExpenses,
      totalExpenses,
      cashCollected,
      depositsApplied,
      refundsGiven,
      netProfit,
      apartmentOnlyProfit,
      billCount: bills.length,
      paidBillCount,
      apartmentExpenseCount: apartmentExpenses.length,
      personalExpenseCount: personalExpenses.length,
    };
  }, [bills, expenses, getBillTotal]);

  const formatCurrency = (value) => {
    return `₱${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const revenueItems = [
    { label: 'Rent', value: breakdownData.revenueBreakdown.rent, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Electricity', value: breakdownData.revenueBreakdown.electricity, color: 'text-yellow-600 dark:text-yellow-400' },
    { label: 'Water', value: breakdownData.revenueBreakdown.water, color: 'text-cyan-600 dark:text-cyan-400' },
    { label: 'WiFi', value: breakdownData.revenueBreakdown.wifi, color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Aircon Cleaning', value: breakdownData.revenueBreakdown.airconCleaning, color: 'text-teal-600 dark:text-teal-400' },
    { label: 'Penalty', value: breakdownData.revenueBreakdown.penalty, color: 'text-red-600 dark:text-red-400' },
    { label: 'Other', value: breakdownData.revenueBreakdown.other, color: 'text-gray-600 dark:text-gray-400' },
  ].filter((item) => item.value > 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 h-full flex flex-col">
      <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-indigo-500" />
        Financial Breakdown
      </h3>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Gross Revenue Section - What you charge to tenants */}
        <div className="border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
          <div className="bg-blue-50 dark:bg-blue-900/30 px-3 py-2 flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Billed to Tenants</span>
              </div>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 ml-6">What you charge in bills</span>
            </div>
            <span className="text-sm font-bold text-blue-800 dark:text-blue-300">
              {formatCurrency(breakdownData.grossRevenue)}
            </span>
          </div>
          <div className="divide-y divide-blue-100 dark:divide-blue-800/50">
            {revenueItems.map((item) => (
              <div key={item.label} className="px-3 py-1.5 flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                <span className={`font-medium ${item.color}`}>{formatCurrency(item.value)}</span>
              </div>
            ))}
            {revenueItems.length === 0 && (
              <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                No revenue recorded
              </div>
            )}
          </div>
        </div>

        {/* Expenses Section - What you pay to providers */}
        <div className="border border-red-200 dark:border-red-800 rounded-lg overflow-hidden">
          <div className="bg-red-50 dark:bg-red-900/30 px-3 py-2 flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-800 dark:text-red-300">Your Expenses</span>
              </div>
              <span className="text-[10px] text-red-600 dark:text-red-400 ml-6">What you pay to providers</span>
            </div>
            <span className="text-sm font-bold text-red-800 dark:text-red-300">
              {formatCurrency(breakdownData.totalExpenses)}
            </span>
          </div>

          {/* Apartment Expenses */}
          {breakdownData.apartmentExpenseCount > 0 && (
            <div className="border-b border-red-100 dark:border-red-800/50">
              <div className="px-3 py-1.5 bg-red-25 dark:bg-red-900/10 flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-red-500" />
                <span className="text-xs font-medium text-red-700 dark:text-red-400">
                  Apartment ({formatCurrency(breakdownData.totalApartmentExpenses)})
                </span>
              </div>
              <div className="divide-y divide-red-50 dark:divide-red-800/30">
                {Object.entries(breakdownData.expensesByCategory)
                  .sort((a, b) => b[1].amount - a[1].amount)
                  .map(([category, data]) => (
                    <div key={category} className="px-3 py-1.5 flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">
                        {getCategoryLabel(category)} ({data.count})
                      </span>
                      <span className="font-medium text-red-600 dark:text-red-400">
                        {formatCurrency(data.amount)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Personal Expenses */}
          {breakdownData.personalExpenseCount > 0 && (
            <div className="px-3 py-1.5 flex items-center justify-between text-xs bg-amber-50/50 dark:bg-amber-900/10">
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-amber-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  Personal ({breakdownData.personalExpenseCount})
                </span>
              </div>
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {formatCurrency(breakdownData.totalPersonalExpenses)}
              </span>
            </div>
          )}

          {breakdownData.totalExpenses === 0 && (
            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              No expenses recorded
            </div>
          )}
        </div>

        {/* Net Profit Calculation */}
        <div className={`border rounded-lg overflow-hidden ${
          breakdownData.netProfit >= 0
            ? 'border-green-200 dark:border-green-800'
            : 'border-orange-200 dark:border-orange-800'
        }`}>
          <div className={`px-3 py-2 flex items-center justify-between ${
            breakdownData.netProfit >= 0
              ? 'bg-green-50 dark:bg-green-900/30'
              : 'bg-orange-50 dark:bg-orange-900/30'
          }`}>
            <div className="flex items-center gap-2">
              <Calculator className={`w-4 h-4 ${
                breakdownData.netProfit >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-orange-600 dark:text-orange-400'
              }`} />
              <span className={`text-sm font-medium ${
                breakdownData.netProfit >= 0
                  ? 'text-green-800 dark:text-green-300'
                  : 'text-orange-800 dark:text-orange-300'
              }`}>Net Profit</span>
            </div>
            <span className={`text-sm font-bold ${
              breakdownData.netProfit >= 0
                ? 'text-green-800 dark:text-green-300'
                : 'text-orange-800 dark:text-orange-300'
            }`}>
              {formatCurrency(breakdownData.netProfit)}
            </span>
          </div>
          <div className="px-3 py-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Billed to Tenants</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {formatCurrency(breakdownData.grossRevenue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">(-) Total Expenses</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {formatCurrency(breakdownData.totalExpenses)}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-1 flex justify-between font-medium">
              <span className="text-gray-700 dark:text-gray-300">= Net Profit</span>
              <span className={breakdownData.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}>
                {formatCurrency(breakdownData.netProfit)}
              </span>
            </div>
            {breakdownData.totalPersonalExpenses > 0 && (
              <div className="flex justify-between pt-1 border-t border-dashed border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-500 italic">Without Personal</span>
                <span className={`italic ${breakdownData.apartmentOnlyProfit >= 0 ? 'text-green-500 dark:text-green-500' : 'text-orange-500 dark:text-orange-500'}`}>
                  {formatCurrency(breakdownData.apartmentOnlyProfit)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Summary note */}
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
          Based on {breakdownData.billCount} bills ({breakdownData.paidBillCount} paid) and {breakdownData.apartmentExpenseCount + breakdownData.personalExpenseCount} expenses
        </p>
      </div>
    </div>
  );
}

export default FinancialBreakdown;

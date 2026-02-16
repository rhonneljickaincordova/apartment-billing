import { useState, useMemo, useRef } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Image, TrendingDown, Wallet, Building2, User } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../../hooks/useExpenses';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Format currency short form
 */
const formatShortCurrency = (amount) => {
  if (amount >= 1000) {
    return `₱${(amount / 1000).toFixed(1)}k`;
  }
  return `₱${amount.toFixed(0)}`;
};

/**
 * Format full currency
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

/**
 * Get category color for display
 */
const getCategoryColor = (category) => {
  const colors = {
    mortgage: 'bg-pink-500',
    electricity: 'bg-yellow-500',
    water: 'bg-blue-500',
    internet: 'bg-purple-500',
    maintenance: 'bg-orange-500',
    repairs: 'bg-red-500',
    supplies: 'bg-green-500',
    taxes: 'bg-gray-500',
    insurance: 'bg-indigo-500',
    other: 'bg-slate-500',
  };
  return colors[category] || colors.other;
};

/**
 * Monthly Expense Report Component
 * Displays monthly expenses by category in a grid layout
 */
function MonthlyExpenseReport({
  expenses,
  onBack,
}) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expenseTypeFilter, setExpenseTypeFilter] = useState('all'); // 'all', 'apartment', 'personal'
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef(null);

  // Get available years from expenses
  const availableYears = useMemo(() => {
    const years = new Set();
    expenses.forEach(exp => {
      if (exp.date) {
        const year = new Date(exp.date).getFullYear();
        years.add(year);
      }
    });
    const yearsArray = Array.from(years).sort((a, b) => b - a);
    if (yearsArray.length === 0) {
      yearsArray.push(new Date().getFullYear());
    }
    return yearsArray;
  }, [expenses]);

  // Filter expenses by type
  const filteredExpenses = useMemo(() => {
    if (expenseTypeFilter === 'all') return expenses;
    return expenses.filter(exp => (exp.expenseType || 'apartment') === expenseTypeFilter);
  }, [expenses, expenseTypeFilter]);

  // Calculate monthly expenses per category
  const monthlyData = useMemo(() => {
    const data = {};

    // Initialize all categories
    EXPENSE_CATEGORIES.forEach(cat => {
      data[cat.value] = {
        categoryName: cat.label,
        categoryValue: cat.value,
        months: Array(12).fill(null).map(() => ({ apartment: 0, personal: 0, total: 0 })),
        total: 0,
        apartmentTotal: 0,
        personalTotal: 0,
      };
    });

    // Process expenses
    filteredExpenses.forEach(expense => {
      if (!expense.date) return;

      const expenseDate = new Date(expense.date);
      const expenseYear = expenseDate.getFullYear();
      const expenseMonth = expenseDate.getMonth();

      if (expenseYear !== selectedYear) return;

      const category = expense.category || 'other';
      const expenseType = expense.expenseType || 'apartment';
      const amount = expense.amount || 0;

      if (!data[category]) {
        data[category] = {
          categoryName: category,
          categoryValue: category,
          months: Array(12).fill(null).map(() => ({ apartment: 0, personal: 0, total: 0 })),
          total: 0,
          apartmentTotal: 0,
          personalTotal: 0,
        };
      }

      data[category].months[expenseMonth][expenseType] += amount;
      data[category].months[expenseMonth].total += amount;
      data[category].total += amount;
      if (expenseType === 'apartment') {
        data[category].apartmentTotal += amount;
      } else {
        data[category].personalTotal += amount;
      }
    });

    return data;
  }, [filteredExpenses, selectedYear]);

  // Sort categories by total expense (highest first)
  const sortedCategories = useMemo(() => {
    return Object.values(monthlyData)
      .filter(cat => cat.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [monthlyData]);

  // Calculate monthly totals
  const monthlyTotals = useMemo(() => {
    const totals = Array(12).fill(null).map(() => ({ apartment: 0, personal: 0, total: 0 }));
    let grandTotal = 0;
    let grandApartment = 0;
    let grandPersonal = 0;

    Object.values(monthlyData).forEach(catData => {
      catData.months.forEach((m, index) => {
        totals[index].apartment += m.apartment;
        totals[index].personal += m.personal;
        totals[index].total += m.total;
      });
      grandTotal += catData.total;
      grandApartment += catData.apartmentTotal;
      grandPersonal += catData.personalTotal;
    });

    return { totals, grandTotal, grandApartment, grandPersonal };
  }, [monthlyData]);

  // Find highest expense month
  const highestMonth = useMemo(() => {
    const maxValue = Math.max(...monthlyTotals.totals.map(t => t.total));
    const index = monthlyTotals.totals.findIndex(t => t.total === maxValue);
    return { index, value: maxValue, name: FULL_MONTHS[index] };
  }, [monthlyTotals]);

  // Current month index
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const handlePrevYear = () => {
    if (availableYears.includes(selectedYear - 1) || selectedYear - 1 >= Math.min(...availableYears) - 1) {
      setSelectedYear(selectedYear - 1);
    }
  };

  const handleNextYear = () => {
    if (selectedYear < new Date().getFullYear()) {
      setSelectedYear(selectedYear + 1);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Category', ...MONTHS.map(m => `${m} (Apt)`), ...MONTHS.map(m => `${m} (Pers)`), 'Total', 'Apartment', 'Personal'];
    const rows = [headers.join(',')];

    sortedCategories.forEach(catData => {
      const row = [
        `"${catData.categoryName}"`,
        ...catData.months.map(m => m.apartment || ''),
        ...catData.months.map(m => m.personal || ''),
        catData.total,
        catData.apartmentTotal,
        catData.personalTotal,
      ];
      rows.push(row.join(','));
    });

    rows.push([
      'Total per Month',
      ...monthlyTotals.totals.map(t => t.apartment || ''),
      ...monthlyTotals.totals.map(t => t.personal || ''),
      monthlyTotals.grandTotal,
      monthlyTotals.grandApartment,
      monthlyTotals.grandPersonal,
    ].join(','));

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Monthly-Expense-Report-${selectedYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate image
  const handleGenerateImage = async () => {
    setIsGenerating(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = reportRef.current;

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `Monthly-Expense-Report-${selectedYear}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4" ref={reportRef}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  Monthly Expense Report
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Track expenses by category per month</p>
              </div>
            </div>

            {/* Year Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevYear}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <span className="text-lg font-bold text-gray-900 dark:text-white min-w-[60px] text-center">
                {selectedYear}
              </span>
              <button
                onClick={handleNextYear}
                disabled={selectedYear >= new Date().getFullYear()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Filter and Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Expense Type Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setExpenseTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  expenseTypeFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setExpenseTypeFilter('apartment')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  expenseTypeFilter === 'apartment'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Apartment
              </button>
              <button
                onClick={() => setExpenseTypeFilter('personal')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  expenseTypeFilter === 'personal'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <User className="w-4 h-4" />
                Personal
              </button>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={handleGenerateImage}
                disabled={isGenerating}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Image className="w-4 h-4" />
                {isGenerating ? '...' : 'Image'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 opacity-80" />
            <span className="text-xs font-medium opacity-80">Total Expenses</span>
          </div>
          <p className="text-xl font-bold">{formatCurrency(monthlyTotals.grandTotal)}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 opacity-80" />
            <span className="text-xs font-medium opacity-80">Apartment</span>
          </div>
          <p className="text-xl font-bold">{formatCurrency(monthlyTotals.grandApartment)}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 opacity-80" />
            <span className="text-xs font-medium opacity-80">Personal</span>
          </div>
          <p className="text-xl font-bold">{formatCurrency(monthlyTotals.grandPersonal)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 opacity-80" />
            <span className="text-xs font-medium opacity-80">Highest Month</span>
          </div>
          <p className="text-xl font-bold">{highestMonth.name || '-'}</p>
          <p className="text-xs opacity-80">{formatCurrency(highestMonth.value)}</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-300 sticky left-0 bg-gray-50 dark:bg-gray-750 z-10 min-w-[120px]">
                  Category
                </th>
                {MONTHS.map((month, index) => (
                  <th
                    key={month}
                    className={`text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400 min-w-[70px] ${
                      index === currentMonth && selectedYear === currentYear
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : ''
                    }`}
                  >
                    {month}
                  </th>
                ))}
                <th className="text-right py-3 px-3 font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 min-w-[90px]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {sortedCategories.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No expenses recorded for {selectedYear}
                  </td>
                </tr>
              ) : (
                sortedCategories.map((catData) => (
                  <tr key={catData.categoryValue} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="py-2.5 px-3 sticky left-0 bg-white dark:bg-gray-800 z-10">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getCategoryColor(catData.categoryValue)}`}></span>
                        <span className="font-medium text-gray-900 dark:text-white text-xs">
                          {catData.categoryName}
                        </span>
                      </div>
                    </td>
                    {catData.months.map((monthData, index) => {
                      const hasExpense = monthData.total > 0;
                      const hasApartment = monthData.apartment > 0;
                      const hasPersonal = monthData.personal > 0;
                      const isCurrent = index === currentMonth && selectedYear === currentYear;

                      return (
                        <td
                          key={index}
                          className={`py-2.5 px-2 text-right ${
                            isCurrent ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          {hasExpense ? (
                            <div className="flex flex-col items-end">
                              <span className="font-medium text-red-600 dark:text-red-400">
                                {formatShortCurrency(monthData.total)}
                              </span>
                              {expenseTypeFilter === 'all' && hasApartment && hasPersonal && (
                                <div className="flex gap-1 text-[9px] leading-tight">
                                  <span className="text-emerald-600 dark:text-emerald-400">A</span>
                                  <span className="text-gray-400">/</span>
                                  <span className="text-amber-600 dark:text-amber-400">P</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3 text-right bg-gray-50 dark:bg-gray-750">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-red-600 dark:text-red-400">
                          {formatCurrency(catData.total)}
                        </span>
                        {expenseTypeFilter === 'all' && (catData.apartmentTotal > 0 || catData.personalTotal > 0) && (
                          <div className="text-[9px] leading-tight text-gray-500 dark:text-gray-400">
                            {catData.apartmentTotal > 0 && (
                              <span className="text-emerald-600 dark:text-emerald-400">
                                A: {formatShortCurrency(catData.apartmentTotal)}
                              </span>
                            )}
                            {catData.apartmentTotal > 0 && catData.personalTotal > 0 && ' | '}
                            {catData.personalTotal > 0 && (
                              <span className="text-amber-600 dark:text-amber-400">
                                P: {formatShortCurrency(catData.personalTotal)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 dark:bg-gray-700 font-semibold">
                <td className="py-3 px-3 sticky left-0 bg-gray-100 dark:bg-gray-700 z-10 text-gray-900 dark:text-white">
                  Total
                </td>
                {monthlyTotals.totals.map((total, index) => {
                  const isCurrent = index === currentMonth && selectedYear === currentYear;
                  return (
                    <td
                      key={index}
                      className={`py-3 px-2 text-right ${
                        isCurrent ? 'bg-blue-100 dark:bg-blue-900/30' : ''
                      }`}
                    >
                      {total.total > 0 ? (
                        <span className="font-bold text-red-600 dark:text-red-400">
                          {formatShortCurrency(total.total)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  );
                })}
                <td className="py-3 px-3 text-right bg-red-100 dark:bg-red-900/30">
                  <span className="font-bold text-red-700 dark:text-red-300 text-base">
                    {formatCurrency(monthlyTotals.grandTotal)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Categories</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{sortedCategories.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Avg/Month</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {formatCurrency(monthlyTotals.grandTotal / 12)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Apartment</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(monthlyTotals.grandApartment)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Personal</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(monthlyTotals.grandPersonal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Monthly Expense Trend</h4>
        <div className="flex items-end gap-1 h-32">
          {MONTHS.map((month, index) => {
            const total = monthlyTotals.totals[index].total;
            const maxTotal = Math.max(...monthlyTotals.totals.map(t => t.total)) || 1;
            const height = (total / maxTotal) * 100;
            const isCurrent = index === currentMonth && selectedYear === currentYear;
            const isHighest = total === highestMonth.value && total > 0;

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t transition-all ${
                    isHighest
                      ? 'bg-gradient-to-t from-red-600 to-red-400'
                      : isCurrent
                      ? 'bg-gradient-to-t from-blue-500 to-blue-400'
                      : 'bg-gradient-to-t from-gray-400 to-gray-300 dark:from-gray-600 dark:to-gray-500'
                  }`}
                  style={{ height: `${Math.max(height, total > 0 ? 5 : 0)}%` }}
                  title={`${month}: ${formatCurrency(total)}`}
                />
                <span className="text-[10px] text-gray-500 dark:text-gray-400">{month}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-500"></span>
            <span className="text-gray-600 dark:text-gray-400">Highest</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-500"></span>
            <span className="text-gray-600 dark:text-gray-400">Current</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonthlyExpenseReport;

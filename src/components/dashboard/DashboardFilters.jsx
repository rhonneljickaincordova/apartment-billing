import { Calendar, X, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Time period options
 */
export const TIME_PERIODS = [
  { value: 'all', label: 'All Year' },
  { value: 'month', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: '6months', label: 'Last 6 Months' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

/**
 * Get available years from data
 */
export const getAvailableYears = (bills, expenses) => {
  const years = new Set();
  const currentYear = new Date().getFullYear();

  // Add current year by default
  years.add(currentYear);

  // Extract years from bills
  bills.forEach((bill) => {
    if (bill.dueDate) {
      const year = new Date(bill.dueDate).getFullYear();
      years.add(year);
    }
  });

  // Extract years from expenses
  expenses.forEach((expense) => {
    if (expense.date) {
      const year = new Date(expense.date).getFullYear();
      years.add(year);
    }
  });

  return Array.from(years).sort((a, b) => b - a);
};

/**
 * Filter data by time period and year
 */
export const filterByPeriod = (date, period, selectedYear, customRange = null) => {
  if (!date) return false;

  const itemDate = new Date(date);
  const now = new Date();
  const itemYear = itemDate.getFullYear();

  // Handle custom date range
  if (period === 'custom' && customRange) {
    const { startDate, endDate } = customRange;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return itemDate >= start && itemDate <= end;
    }
    return true;
  }

  // If "all" period, only filter by year
  if (period === 'all') {
    return itemYear === selectedYear;
  }

  // Filter by selected year first
  if (itemYear !== selectedYear) return false;

  switch (period) {
    case 'month': {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      return itemDate.getMonth() === currentMonth && itemYear === currentYear;
    }
    case 'lastMonth': {
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return itemDate.getMonth() === lastMonth && itemYear === lastMonthYear;
    }
    case 'quarter': {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const itemQuarter = Math.floor(itemDate.getMonth() / 3);
      return itemQuarter === currentQuarter && itemYear === now.getFullYear();
    }
    case '6months': {
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      return itemDate >= sixMonthsAgo && itemDate <= now;
    }
    case 'year':
    default:
      return true; // Already filtered by year above
  }
};

/**
 * Get period display label
 */
const getPeriodDisplayLabel = (period, selectedYear, customRange) => {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  switch (period) {
    case 'month':
      return `${months[now.getMonth()]} ${now.getFullYear()}`;
    case 'lastMonth': {
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return `${months[lastMonth]} ${year}`;
    }
    case 'quarter': {
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      return `Q${quarter} ${now.getFullYear()}`;
    }
    case '6months':
      return `Last 6 Months`;
    case 'year':
      return `${selectedYear}`;
    case 'custom':
      if (customRange?.startDate && customRange?.endDate) {
        const start = new Date(customRange.startDate);
        const end = new Date(customRange.endDate);
        return `${months[start.getMonth()]} ${start.getDate()} - ${months[end.getMonth()]} ${end.getDate()}`;
      }
      return 'Custom Range';
    case 'all':
      return `Year ${selectedYear}`;
    default:
      return '';
  }
};

/**
 * Dashboard Filters Component
 * Global filters for all dashboard components
 */
function DashboardFilters({
  timePeriod,
  selectedYear,
  availableYears,
  customRange,
  onTimePeriodChange,
  onYearChange,
  onCustomRangeChange
}) {
  const showCustomRange = timePeriod === 'custom';
  const displayLabel = getPeriodDisplayLabel(timePeriod, selectedYear, customRange);
  const currentYear = new Date().getFullYear();

  const handlePrevYear = () => {
    const minYear = Math.min(...availableYears);
    if (selectedYear > minYear - 1) {
      onYearChange(selectedYear - 1);
    }
  };

  const handleNextYear = () => {
    if (selectedYear < currentYear) {
      onYearChange(selectedYear + 1);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 md:p-4 flex-1">
      {/* Filter Row - Similar to Business Report */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Filter Label */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
          <Filter className="w-4 h-4" />
          <span className="hidden xs:inline">Period:</span>
        </div>

        {/* Year Navigation - Hide for 6months and custom */}
        {timePeriod !== 'custom' && timePeriod !== '6months' && (
          <div className="flex items-center gap-0.5">
            <button
              onClick={handlePrevYear}
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Previous year"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <span className="px-2 sm:px-3 py-1 text-sm font-semibold text-gray-900 dark:text-white min-w-[50px] text-center">
              {selectedYear}
            </span>
            <button
              onClick={handleNextYear}
              disabled={selectedYear >= currentYear}
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next year"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        )}

        {/* Period Dropdown */}
        <select
          value={timePeriod}
          onChange={(e) => onTimePeriodChange(e.target.value)}
          className="px-2 sm:px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {TIME_PERIODS.map((period) => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </select>

        {/* Showing Label */}
        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-auto">
          Showing: <span className="font-medium text-blue-600 dark:text-blue-400">{displayLabel}</span>
        </span>
      </div>

      {/* Custom Date Range (conditionally shown) */}
      {showCustomRange && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">From:</span>
            <input
              type="date"
              value={customRange?.startDate || ''}
              onChange={(e) => onCustomRangeChange?.({ ...customRange, startDate: e.target.value })}
              className="flex-1 sm:flex-none border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">To:</span>
            <input
              type="date"
              value={customRange?.endDate || ''}
              onChange={(e) => onCustomRangeChange?.({ ...customRange, endDate: e.target.value })}
              className="flex-1 sm:flex-none border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {(customRange?.startDate || customRange?.endDate) && (
              <button
                onClick={() => onCustomRangeChange?.({ startDate: '', endDate: '' })}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Clear dates"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardFilters;

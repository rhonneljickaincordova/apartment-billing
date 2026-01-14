import { Calendar, CalendarDays, X } from 'lucide-react';

/**
 * Time period options
 */
export const TIME_PERIODS = [
  { value: 'month', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: '6months', label: 'Last 6 Months' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
  { value: 'all', label: 'All Time' },
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
      return `All of ${selectedYear}`;
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 md:p-4">
      {/* Period Quick Select Buttons - Scrollable on mobile */}
      <div className="overflow-x-auto pb-2 -mx-3 px-3 md:mx-0 md:px-0 md:overflow-visible">
        <div className="flex items-center gap-1.5 md:gap-2 md:flex-wrap min-w-max md:min-w-0 mb-3 md:mb-4">
          {TIME_PERIODS.filter(p => p.value !== 'custom').map((period) => (
            <button
              key={period.value}
              onClick={() => onTimePeriodChange(period.value)}
              className={`px-2.5 md:px-3 py-1.5 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                timePeriod === period.value
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {period.label}
            </button>
          ))}
          <button
            onClick={() => onTimePeriodChange('custom')}
            className={`px-2.5 md:px-3 py-1.5 text-xs md:text-sm font-medium rounded-lg transition-all flex items-center gap-1 whitespace-nowrap ${
              timePeriod === 'custom'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Custom
          </button>
        </div>
      </div>

      {/* Custom Date Range (conditionally shown) */}
      {showCustomRange && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 md:mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500 hidden sm:block" />
            <span className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">From:</span>
            <input
              type="date"
              value={customRange?.startDate || ''}
              onChange={(e) => onCustomRangeChange?.({ ...customRange, startDate: e.target.value })}
              className="flex-1 sm:flex-none border rounded-lg px-2 md:px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">To:</span>
            <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">to</span>
            <input
              type="date"
              value={customRange?.endDate || ''}
              onChange={(e) => onCustomRangeChange?.({ ...customRange, endDate: e.target.value })}
              className="flex-1 sm:flex-none border rounded-lg px-2 md:px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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

      {/* Year selector and current filter display */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Showing:</span>
          <span className="text-xs md:text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 md:px-3 py-1 rounded-full">
            {displayLabel}
          </span>
        </div>

        {timePeriod !== 'custom' && timePeriod !== '6months' && (
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(parseInt(e.target.value))}
              className="border rounded-lg px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardFilters;

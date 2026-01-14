import { Calendar, Filter } from 'lucide-react';

/**
 * Time period options
 */
export const TIME_PERIODS = [
  { value: 'month', label: 'This Month' },
  { value: '6months', label: 'Last 6 Months' },
  { value: 'year', label: 'This Year' },
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
export const filterByPeriod = (date, period, selectedYear) => {
  if (!date) return false;

  const itemDate = new Date(date);
  const now = new Date();
  const itemYear = itemDate.getFullYear();

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
 * Dashboard Filters Component
 * Global filters for all dashboard components
 */
function DashboardFilters({ timePeriod, selectedYear, availableYears, onTimePeriodChange, onYearChange }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Dashboard Filters
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={timePeriod}
              onChange={(e) => onTimePeriodChange(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {TIME_PERIODS.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(parseInt(e.target.value))}
              className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardFilters;

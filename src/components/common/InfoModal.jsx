import { X, Info } from 'lucide-react';

/**
 * InfoModal Component
 * A reusable modal for displaying help/information content
 */
function InfoModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * InfoButton Component
 * A small info icon button that triggers the modal
 */
export function InfoButton({ onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`p-2 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors ${className}`}
      title="What's this?"
    >
      <Info className="w-5 h-5" />
    </button>
  );
}

/**
 * Dashboard Info Content
 */
export function DashboardInfoContent() {
  return (
    <div className="space-y-6 text-gray-700 dark:text-gray-300">
      <p className="text-gray-600 dark:text-gray-400">
        The Dashboard provides a quick overview of your apartment billing status for the <strong>selected time period</strong>.
      </p>

      <div className="space-y-4">
        <InfoSection
          title="Time Period Filter"
          color="blue"
          items={[
            'Use the filter at the top to view data for This Month, Last Month, This Year, or a Custom Range',
            'All cards and charts below will update based on your selected period',
          ]}
        />

        <InfoSection
          title="Summary Cards"
          color="emerald"
          items={[
            'Rooms: Shows occupied vs total rooms',
            'Pending Bills: Bills due but not yet paid',
            'Overdue Bills: Past due date and unpaid',
            'Paid Rooms: Rooms with payments collected',
          ]}
        />

        <InfoSection
          title="Financial Summary"
          color="purple"
          items={[
            'Total Revenue: Sum of all bill amounts generated',
            'Collected: Actual cash payments received',
            'Outstanding: Amount still owed from unpaid bills',
            'Expenses: Total apartment-related expenses',
          ]}
        />

        <InfoSection
          title="Monthly Comparison"
          color="amber"
          items={[
            'Compares current month vs previous month',
            'Shows revenue, collections, and expenses trends',
            'Helps identify if business is improving',
          ]}
        />

        <InfoSection
          title="Charts"
          color="rose"
          items={[
            'Monthly Bills: Revenue generated per month',
            'Monthly Expenses: Spending per month',
            'Bills by Room: Which rooms generate most revenue',
            'Expenses by Category: Where money is being spent',
          ]}
        />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Tip:</strong> The Dashboard shows filtered data based on your selected time period.
          For overall business health and bank balance, check the <strong>Reports</strong> tab.
        </p>
      </div>
    </div>
  );
}

/**
 * Reports Info Content
 */
export function ReportsInfoContent() {
  return (
    <div className="space-y-6 text-gray-700 dark:text-gray-300">
      <p className="text-gray-600 dark:text-gray-400">
        The Reports section provides detailed financial reports to track your apartment business performance.
      </p>

      <div className="space-y-4">
        <InfoSection
          title="Summary Report"
          color="blue"
          items={[
            'Shows overall business metrics for the selected period (year/month)',
            'Financial Summary: Bill Payments + Move-in Payments - Expenses - Refunds = Net Cash Flow',
            'Property & Tenant Overview: Current occupancy status',
            'Bills Status: Paid, Unpaid, Overdue counts',
            'Payment Timeliness: On-time vs late payment rates',
          ]}
        />

        <InfoSection
          title="Cash Flow Breakdown"
          color="emerald"
          items={[
            'Bill Payments: Actual cash collected from monthly bills (excludes deposits used)',
            'Move-in Payments: Advance rent + Security deposit from new tenants',
            'Apt. Expenses: Apartment-related expenses (maintenance, utilities, etc.)',
            'Refunds: Money returned when deposit exceeds final bill',
          ]}
        />

        <InfoSection
          title="Monthly Collection Report"
          color="purple"
          items={[
            'Grid view showing collections per room per month',
            'Tracks bill payments, move-in payments (new), and refunds (out)',
            'Net Total: Actual cash received per room for the year',
            'Useful for tracking which rooms generate consistent income',
          ]}
        />

        <InfoSection
          title="Monthly Expense Report"
          color="amber"
          items={[
            'Grid view showing expenses by category per month',
            'Filter by expense type: All, Apartment only, Personal only',
            'Track spending patterns throughout the year',
            'Identify which categories consume most budget',
          ]}
        />

        <InfoSection
          title="Period Filter"
          color="rose"
          items={[
            'Year selector: Navigate between years',
            'Month dropdown: View specific month or entire year',
            'All financial metrics update based on selected period',
          ]}
        />
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          <strong>Important:</strong> The "Net Cash Flow" represents actual cash movement for the period.
          For your total bank balance from the start, select "All Year" and include all years of operation.
        </p>
      </div>
    </div>
  );
}

/**
 * InfoSection Helper Component
 */
function InfoSection({ title, color, items }) {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800',
    purple: 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800',
    amber: 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800',
    rose: 'bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800',
  };

  const titleColors = {
    blue: 'text-blue-800 dark:text-blue-300',
    emerald: 'text-emerald-800 dark:text-emerald-300',
    purple: 'text-purple-800 dark:text-purple-300',
    amber: 'text-amber-800 dark:text-amber-300',
    rose: 'text-rose-800 dark:text-rose-300',
  };

  return (
    <div className={`rounded-lg p-4 border ${colors[color]}`}>
      <h4 className={`font-semibold mb-2 ${titleColors[color]}`}>{title}</h4>
      <ul className="space-y-1 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-gray-400 mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InfoModal;

import { Activity, CheckCircle, FileText, Receipt, Clock, Wallet } from 'lucide-react';

/**
 * Recent Activity Feed Component
 * Shows recent payments, bills, and expenses
 */
function RecentActivity({ bills, expenses, getRoomById, getBillTotal }) {
  // Combine and sort activities by date
  const activities = [];

  // Add paid bills as "payment" or "deposit applied" activities
  bills
    .filter((bill) => bill.paid && bill.paidDate)
    .forEach((bill) => {
      // Check if this bill was settled via deposit (no actual cash received)
      const isDepositSettlement = bill.depositApplied && bill.depositAmount > 0;

      activities.push({
        id: `payment-${bill.id}`,
        type: isDepositSettlement ? 'deposit' : 'payment',
        date: bill.paidDate,
        roomName: getRoomById(bill.roomId)?.name || 'Unknown',
        amount: getBillTotal(bill, bill.rentExcluded || false),
        icon: isDepositSettlement ? Wallet : CheckCircle,
        iconBg: isDepositSettlement
          ? 'bg-purple-100 dark:bg-purple-900/50'
          : 'bg-green-100 dark:bg-green-900/50',
        iconColor: isDepositSettlement
          ? 'text-purple-600 dark:text-purple-400'
          : 'text-green-600 dark:text-green-400',
        label: isDepositSettlement ? 'Deposit applied' : 'Payment received',
      });
    });

  // Add unpaid bills as "bill created" activities
  bills
    .filter((bill) => !bill.paid)
    .forEach((bill) => {
      activities.push({
        id: `bill-${bill.id}`,
        type: 'bill',
        date: bill.createdAt || bill.dueDate,
        roomName: getRoomById(bill.roomId)?.name || 'Unknown',
        amount: getBillTotal(bill, bill.rentExcluded || false),
        dueDate: bill.dueDate,
        icon: FileText,
        iconBg: 'bg-blue-100 dark:bg-blue-900/50',
        iconColor: 'text-blue-600 dark:text-blue-400',
        label: 'Bill created',
      });
    });

  // Add expenses
  expenses.forEach((expense) => {
    activities.push({
      id: `expense-${expense.id}`,
      type: 'expense',
      date: expense.date,
      description: expense.description,
      category: expense.category,
      amount: expense.amount,
      icon: Receipt,
      iconBg: 'bg-red-100 dark:bg-red-900/50',
      iconColor: 'text-red-600 dark:text-red-400',
      label: 'Expense recorded',
    });
  });

  // Sort by date (most recent first) and take top 8
  const sortedActivities = activities
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  const formatCurrency = (value) => {
    return `₱${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = now - d;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Recent Activity
        </h2>
        <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
          {sortedActivities.length} items
        </span>
      </div>

      {sortedActivities.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {sortedActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-2 md:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className={`p-2 rounded-lg flex-shrink-0 ${activity.iconBg}`}>
                  <Icon className={`w-4 h-4 ${activity.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.type === 'expense' ? activity.description : activity.roomName}
                    </p>
                    <span className={`text-sm font-semibold flex-shrink-0 ${
                      activity.type === 'payment'
                        ? 'text-green-600 dark:text-green-400'
                        : activity.type === 'deposit'
                        ? 'text-purple-600 dark:text-purple-400'
                        : activity.type === 'expense'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}>
                      {activity.type === 'expense' ? '-' : ''}{formatCurrency(activity.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.label}
                      {activity.type === 'expense' && activity.category && (
                        <span className="ml-1 capitalize">• {activity.category}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(activity.date)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RecentActivity;

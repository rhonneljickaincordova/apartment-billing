import { DollarSign, Wind } from 'lucide-react';

/**
 * Alerts List Component
 * Displays overdue bills and cleaning alerts
 */
function AlertsList({ overdueBills, overdueCleanings, getRoomById }) {
  const hasAlerts = overdueBills.length > 0 || overdueCleanings.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Alerts</h2>
      <div className="space-y-3" role="list" aria-label="Alerts">
        {overdueBills.map((bill) => {
          const room = getRoomById(bill.roomId);
          return (
            <div
              key={bill.id}
              className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg"
              role="listitem"
            >
              <DollarSign className="w-5 h-5 text-red-500" aria-hidden="true" />
              <span className="text-red-700 dark:text-red-300">
                Overdue bill for <strong>{room?.name}</strong> - Due: {bill.dueDate}
              </span>
            </div>
          );
        })}
        {overdueCleanings.map((cleaning) => {
          const room = getRoomById(cleaning.roomId);
          return (
            <div
              key={cleaning.id}
              className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg"
              role="listitem"
            >
              <Wind className="w-5 h-5 text-orange-500" aria-hidden="true" />
              <span className="text-orange-700 dark:text-orange-300">
                Aircon cleaning overdue for <strong>{room?.name}</strong> - Due: {cleaning.nextDue}
              </span>
            </div>
          );
        })}
        {!hasAlerts && (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">
            No alerts at this time. All bills and cleaning schedules are up to date.
          </div>
        )}
      </div>
    </div>
  );
}

export default AlertsList;

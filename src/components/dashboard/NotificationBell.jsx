import { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, Clock, X } from 'lucide-react';

/**
 * Notification Bell Component
 * Shows alerts as notifications in a dropdown
 */
function NotificationBell({ overdueBills, overdueCleanings, getRoomById }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const totalAlerts = (overdueBills?.length || 0) + (overdueCleanings?.length || 0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {totalAlerts > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {totalAlerts > 9 ? '9+' : totalAlerts}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {totalAlerts === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {/* Overdue Bills */}
                {overdueBills?.map((bill) => {
                  const room = getRoomById(bill.roomId);
                  return (
                    <div
                      key={bill.id}
                      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Overdue Bill
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {room?.name || 'Unknown Room'} - Due: {bill.dueDate}
                          </p>
                        </div>
                        <span className="flex-shrink-0 text-xs text-red-600 dark:text-red-400 font-medium">
                          Overdue
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Overdue Cleanings */}
                {overdueCleanings?.map((schedule) => {
                  const room = getRoomById(schedule.roomId);
                  return (
                    <div
                      key={schedule.id}
                      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Aircon Cleaning Due
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {room?.name || 'Unknown Room'}
                          </p>
                        </div>
                        <span className="flex-shrink-0 text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                          Due
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {totalAlerts > 0 && (
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                {totalAlerts} alert{totalAlerts !== 1 ? 's' : ''} requiring attention
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;

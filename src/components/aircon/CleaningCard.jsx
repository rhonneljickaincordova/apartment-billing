import { Edit2, Trash2, Calendar, Wind, CheckCircle, Clock, AlertCircle } from 'lucide-react';

/**
 * Cleaning Card Component
 * Displays a single aircon cleaning schedule
 */
function CleaningCard({
  schedule,
  roomName,
  isOverdue,
  isDueSoon,
  onViewHistory,
  onEdit,
  onDelete,
  onMarkCleaned,
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 ${
        isOverdue ? 'border-red-500' : isDueSoon ? 'border-yellow-500' : 'border-green-500'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{roomName}</h3>
        <div className="flex gap-1">
          <button
            onClick={onViewHistory}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
            aria-label={`View cleaning history for ${roomName}`}
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="text-blue-500 hover:text-blue-700 p-1"
            aria-label={`Edit schedule for ${roomName}`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 p-1"
            aria-label={`Delete schedule for ${roomName}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <p className="text-gray-600 dark:text-gray-400">
          <span className="font-medium">Interval:</span> Every {schedule.cleaningInterval} month(s)
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          <span className="font-medium">Last Cleaned:</span> {schedule.lastCleaned}
        </p>
        <p
          className={`font-medium flex items-center gap-1 ${
            isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-green-600'
          }`}
        >
          {isOverdue && <AlertCircle className="w-4 h-4" />}
          {isDueSoon && !isOverdue && <Clock className="w-4 h-4" />}
          {!isOverdue && !isDueSoon && <CheckCircle className="w-4 h-4" />}
          <span>Next Due: {schedule.nextDue}</span>
          {isOverdue && ' (Overdue!)'}
          {isDueSoon && !isOverdue && ' (Due Soon!)'}
        </p>
      </div>
      <button
        onClick={onMarkCleaned}
        className="w-full mt-4 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
      >
        <Wind className="w-4 h-4" />
        Mark as Cleaned
      </button>
    </div>
  );
}

export default CleaningCard;

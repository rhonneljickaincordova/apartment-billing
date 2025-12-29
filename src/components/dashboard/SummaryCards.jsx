/**
 * Summary Cards Component
 * Displays key metrics in card format
 */
function SummaryCards({ totalRooms, occupiedRooms, pendingBills, overdueBills, airconDue }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">Total Rooms</div>
        <div className="text-2xl font-bold text-gray-800 dark:text-white">{totalRooms}</div>
        <div className="text-xs text-green-600">{occupiedRooms} occupied</div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">Pending Bills</div>
        <div className="text-2xl font-bold text-yellow-600">{pendingBills}</div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">Overdue Bills</div>
        <div className="text-2xl font-bold text-red-600">{overdueBills}</div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">Aircon Due</div>
        <div className="text-2xl font-bold text-orange-600">{airconDue}</div>
      </div>
    </div>
  );
}

export default SummaryCards;

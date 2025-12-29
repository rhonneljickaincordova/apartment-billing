/**
 * Revenue Cards Component
 * Displays revenue summary (collected, pending, total)
 */
function RevenueCards({ collected, pending, total }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Revenue Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
          <div className="text-sm text-green-600 dark:text-green-400">Collected</div>
          <div className="text-xl font-bold text-green-700 dark:text-green-300">
            ₱{collected.toLocaleString()}
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4">
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
          <div className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
            ₱{pending.toLocaleString()}
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
          <div className="text-sm text-blue-600 dark:text-blue-400">Total Billed</div>
          <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
            ₱{total.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RevenueCards;

import { TrendingUp, Clock, Wallet } from 'lucide-react';

/**
 * Revenue Cards Component
 * Displays revenue summary with visual progress bar
 */
function RevenueCards({ collected, pending, total }) {
  const collectionRate = total > 0 ? (collected / total) * 100 : 0;

  const formatCurrency = (value) => {
    return `₱${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-500" />
          Revenue Overview
        </h2>
        <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
          {collectionRate.toFixed(1)}% collected
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 md:mb-6">
        <div className="h-2 md:h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${collectionRate}%` }}
          />
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <div className="text-center p-2 md:p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
          <div className="flex items-center justify-center mb-1 md:mb-2">
            <div className="p-1.5 md:p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-[10px] md:text-xs text-green-600 dark:text-green-400 font-medium mb-0.5 md:mb-1">Collected</p>
          <p className="text-sm md:text-lg font-bold text-green-700 dark:text-green-300 truncate">
            {formatCurrency(collected)}
          </p>
        </div>

        <div className="text-center p-2 md:p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
          <div className="flex items-center justify-center mb-1 md:mb-2">
            <div className="p-1.5 md:p-2 bg-amber-100 dark:bg-amber-800/50 rounded-lg">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-[10px] md:text-xs text-amber-600 dark:text-amber-400 font-medium mb-0.5 md:mb-1">Pending</p>
          <p className="text-sm md:text-lg font-bold text-amber-700 dark:text-amber-300 truncate">
            {formatCurrency(pending)}
          </p>
        </div>

        <div className="text-center p-2 md:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <div className="flex items-center justify-center mb-1 md:mb-2">
            <div className="p-1.5 md:p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
              <Wallet className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-[10px] md:text-xs text-blue-600 dark:text-blue-400 font-medium mb-0.5 md:mb-1">Total</p>
          <p className="text-sm md:text-lg font-bold text-blue-700 dark:text-blue-300 truncate">
            {formatCurrency(total)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default RevenueCards;

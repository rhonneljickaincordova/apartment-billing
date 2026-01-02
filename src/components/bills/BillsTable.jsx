import {
  Edit2,
  Trash2,
  Printer,
  Calendar,
  Zap,
  Droplet,
  Wifi,
  Wind,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

/**
 * Status Badge Component
 */
function StatusBadge({ status, overdue }) {
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle className="w-3 h-3" aria-hidden="true" />
        Paid
      </span>
    );
  }
  if (overdue) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
        <AlertCircle className="w-3 h-3" aria-hidden="true" />
        Overdue
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
      <Clock className="w-3 h-3" aria-hidden="true" />
      Pending
    </span>
  );
}

/**
 * Bills Table Component
 * Displays bills in a table format with actions
 */
function BillsTable({
  bills,
  getRoomById,
  getBillTotal,
  isBillOverdue,
  isBillDueSoon,
  onTogglePaid,
  onPrint,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Room
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Due Date
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Rent
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Electricity
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Water
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                WiFi
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Aircon
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Total
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Status
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {bills.map((bill) => {
              const room = getRoomById(bill.roomId);
              const total = getBillTotal(bill);
              const overdue = isBillOverdue(bill);
              const dueSoon = isBillDueSoon(bill);

              return (
                <tr
                  key={bill.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    overdue
                      ? 'bg-red-50 dark:bg-red-900/20'
                      : dueSoon
                      ? 'bg-yellow-50 dark:bg-yellow-900/20'
                      : ''
                  }`}
                >
                  <td className="px-3 md:px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {room?.name || 'Unknown'}
                  </td>
                  <td className="px-3 md:px-6 py-4 text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" aria-hidden="true" />
                      {bill.dueDate}
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-4 text-gray-700 dark:text-gray-300">
                    ₱{(bill.rentBill || 0).toFixed(2)}
                  </td>
                  <td className="px-3 md:px-6 py-4 text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-500" aria-hidden="true" />₱
                      {(bill.electricityBill || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-4 text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <Droplet className="w-4 h-4 text-blue-500" aria-hidden="true" />₱
                      {(bill.waterBill || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-4 text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <Wifi className="w-4 h-4 text-green-500" aria-hidden="true" />₱
                      {(bill.wifiBill || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-4 text-gray-700 dark:text-gray-300">
                    {bill.airconCleaningBill > 0 ? (
                      <div className="flex items-center gap-1">
                        <Wind className="w-4 h-4 text-cyan-500" aria-hidden="true" />₱
                        {(bill.airconCleaningBill || 0).toFixed(2)}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 md:px-6 py-4 font-bold text-gray-900 dark:text-white">
                    ₱{total.toFixed(2)}
                  </td>
                  <td className="px-3 md:px-6 py-4">
                    <button
                      onClick={() => onTogglePaid(bill.id)}
                      className="cursor-pointer"
                      aria-label={`Toggle payment status for ${room?.name}`}
                    >
                      <StatusBadge status={bill.paid ? 'paid' : 'unpaid'} overdue={overdue} />
                    </button>
                  </td>
                  <td className="px-3 md:px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onPrint(bill)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                        aria-label={`Print bill for ${room?.name}`}
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(bill)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        aria-label={`Edit bill for ${room?.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(bill.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        aria-label={`Delete bill for ${room?.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {bills.length === 0 && (
              <tr>
                <td colSpan="10" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No bills found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BillsTable;

import { useState } from 'react';
import {
  Edit2,
  Trash2,
  Printer,
  Calendar,
  CalendarCheck,
  Zap,
  Droplet,
  Wifi,
  Wind,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Wallet,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

/**
 * Status Badge Component
 * Now supports 'paid', 'partial', 'pending', 'overdue' statuses
 */
function StatusBadge({ status, remainingBalance }) {
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle className="w-3 h-3" aria-hidden="true" />
        Paid
      </span>
    );
  }
  if (status === 'partial') {
    return (
      <div className="flex flex-col items-start gap-0.5">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          <DollarSign className="w-3 h-3" aria-hidden="true" />
          Partial
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 pl-1">
          ₱{remainingBalance.toFixed(2)} left
        </span>
      </div>
    );
  }
  if (status === 'overdue') {
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
 * Sortable Header Component
 */
function SortableHeader({ field, label, sortField, sortDirection, onSort, icon: Icon, className = '' }) {
  const isActive = sortField === field;

  const getSortIcon = () => {
    if (!onSort) return null;
    if (!isActive) return <ArrowUpDown className="w-3 h-3 opacity-50" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  return (
    <th className={`px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase ${className}`}>
      <button
        onClick={() => onSort?.(field)}
        className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-100 transition-colors"
      >
        {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
        {label}
        {getSortIcon()}
      </button>
    </th>
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
  getBillStatus,
  getRemainingBalance,
  isBillOverdue,
  isBillDueSoon,
  onRecordPayment,
  onViewPaymentHistory,
  onPrint,
  onEdit,
  onDelete,
  sortField = 'dueDate',
  sortDirection = 'desc',
  onSort,
}) {
  const [expandedBills, setExpandedBills] = useState({});

  const toggleExpand = (billId) => {
    setExpandedBills(prev => ({
      ...prev,
      [billId]: !prev[billId]
    }));
  };

  const handleStatusClick = (bill, status) => {
    if (status === 'paid' && onViewPaymentHistory) {
      onViewPaymentHistory(bill);
    } else {
      onRecordPayment(bill);
    }
  };

  // Mobile card view for a single bill
  const MobileBillCard = ({ bill }) => {
    const room = getRoomById(bill.roomId);
    const excludeRent = bill.rentExcluded || false;
    const total = getBillTotal(bill, excludeRent);
    const status = getBillStatus(bill);
    const remainingBalance = getRemainingBalance(bill);
    const overdue = status === 'overdue';
    const dueSoon = isBillDueSoon(bill) && status !== 'paid';
    const isExpanded = expandedBills[bill.id];

    const bgClass = overdue
      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      : dueSoon
      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';

    return (
      <div className={`rounded-lg border p-4 ${bgClass}`}>
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 dark:text-white truncate">
                {room?.name || 'Unknown'}
              </span>
              <button
                onClick={() => handleStatusClick(bill, status)}
                className="flex-shrink-0"
              >
                <StatusBadge status={status} remainingBalance={remainingBalance} />
              </button>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Due: {bill.dueDate}</span>
              {bill.paidDate && (
                <>
                  <span className="mx-1">•</span>
                  <CalendarCheck className="w-3.5 h-3.5 text-green-500" />
                  <span>Paid: {bill.paidDate}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-gray-900 dark:text-white">₱{total.toFixed(2)}</p>
          </div>
        </div>

        {/* Expandable Details */}
        <button
          onClick={() => toggleExpand(bill.id)}
          className="w-full flex items-center justify-center gap-1 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          {isExpanded ? (
            <>
              <span>Hide details</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Show details</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>

        {isExpanded && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {/* Bill Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span>Rent:</span>
                <span className="font-medium text-gray-900 dark:text-white">₱{(bill.rentBill || 0).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-gray-900 dark:text-white">₱{(bill.electricityBill || 0).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Droplet className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-gray-900 dark:text-white">₱{(bill.waterBill || 0).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="font-medium text-gray-900 dark:text-white">₱{(bill.wifiBill || 0).toFixed(2)}</span>
              </div>
              {bill.airconCleaningBill > 0 && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Wind className="w-4 h-4 text-cyan-500" />
                  <span className="font-medium text-gray-900 dark:text-white">₱{(bill.airconCleaningBill || 0).toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Payment Info */}
            {bill.paid && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                {(() => {
                  const amountPaid = bill.amountPaid || 0;
                  const paymentHistory = bill.paymentHistory || [];
                  const lastPayment = paymentHistory[paymentHistory.length - 1];
                  const paymentMethod = lastPayment?.paymentMethods?.[0]?.method || 'Cash';

                  if (bill.depositApplied && bill.depositAmount > 0) {
                    const depositUsed = bill.depositAmount || 0;
                    const refundAmount = depositUsed - total;
                    const cashPaid = Math.max(0, amountPaid - depositUsed);

                    if (refundAmount > 0) {
                      return (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <RotateCcw className="w-4 h-4" />
                          <span className="font-medium">Refund: ₱{refundAmount.toFixed(2)}</span>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                          <Wallet className="w-4 h-4" />
                          <span>Deposit: ₱{depositUsed.toFixed(2)}</span>
                        </div>
                        {cashPaid > 0 && (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <DollarSign className="w-4 h-4" />
                            <span>{paymentMethod}: ₱{cashPaid.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <DollarSign className="w-4 h-4" />
                      <span>{paymentMethod}: ₱{amountPaid.toFixed(2)}</span>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onPrint(bill)}
            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
            title="Print"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button
            onClick={() => onEdit(bill)}
            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
            title="Edit"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(bill.id)}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Mobile Card View */}
      <div className="md:hidden p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {bills.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No bills found.
          </div>
        ) : (
          bills.map((bill) => <MobileBillCard key={bill.id} bill={bill} />)
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <SortableHeader
                field="status"
                label="Status"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <th className="px-2 md:px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-12">
                <Printer className="w-4 h-4 mx-auto" aria-hidden="true" />
              </th>
              <SortableHeader
                field="room"
                label="Room"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableHeader
                field="dueDate"
                label="Due Date"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableHeader
                field="paidDate"
                label="Paid Date"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
                icon={CalendarCheck}
              />
              <SortableHeader
                field="rentBill"
                label="Rent"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableHeader
                field="electricityBill"
                label="Electricity"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
                icon={Zap}
              />
              <SortableHeader
                field="waterBill"
                label="Water"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
                icon={Droplet}
              />
              <SortableHeader
                field="wifiBill"
                label="WiFi"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
                icon={Wifi}
              />
              <SortableHeader
                field="airconCleaningBill"
                label="Aircon"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
                icon={Wind}
              />
              <SortableHeader
                field="total"
                label="Total"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                <div className="flex items-center gap-1">
                  <Wallet className="w-4 h-4" aria-hidden="true" />
                  Deposit/Cash
                </div>
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {bills.map((bill) => {
              const room = getRoomById(bill.roomId);
              const excludeRent = bill.rentExcluded || false;
              const total = getBillTotal(bill, excludeRent);
              const status = getBillStatus(bill);
              const remainingBalance = getRemainingBalance(bill);
              const overdue = status === 'overdue';
              const dueSoon = isBillDueSoon(bill) && status !== 'paid';

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
                  <td className="px-3 md:px-6 py-4">
                    <button
                      onClick={() => handleStatusClick(bill, status)}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      aria-label={status === 'paid' ? `View payment history for ${room?.name}` : `Record payment for ${room?.name}`}
                      title={status === 'paid' ? 'Click to view payment history' : 'Click to record payment'}
                    >
                      <StatusBadge status={status} remainingBalance={remainingBalance} />
                    </button>
                  </td>
                  <td className="px-2 md:px-3 py-4 text-center">
                    <button
                      onClick={() => onPrint(bill)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      title="Print"
                      aria-label={`Print bill for ${room?.name}`}
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                  </td>
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
                    {bill.paidDate ? (
                      <div className="flex items-center gap-1">
                        <CalendarCheck className="w-4 h-4 text-green-500" aria-hidden="true" />
                        {bill.paidDate}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
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
                    {(() => {
                      const amountPaid = bill.amountPaid || 0;
                      const paymentHistory = bill.paymentHistory || [];
                      const lastPayment = paymentHistory[paymentHistory.length - 1];
                      const paymentMethod = lastPayment?.paymentMethods?.[0]?.method || 'Cash';

                      if (bill.depositApplied && bill.depositAmount > 0) {
                        const depositUsed = bill.depositAmount || 0;
                        const refundAmount = depositUsed - total;
                        const cashPaid = Math.max(0, amountPaid - depositUsed);

                        if (refundAmount > 0) {
                          return (
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <RotateCcw className="w-4 h-4" aria-hidden="true" />
                              <span className="font-medium">₱{refundAmount.toFixed(2)}</span>
                            </div>
                          );
                        }

                        if (cashPaid > 0) {
                          return (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                                <Wallet className="w-3 h-3" aria-hidden="true" />
                                <span className="text-xs">Deposit: ₱{depositUsed.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <DollarSign className="w-3 h-3" aria-hidden="true" />
                                <span className="text-xs font-medium">{paymentMethod}: ₱{cashPaid.toFixed(2)}</span>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                            <Wallet className="w-4 h-4" aria-hidden="true" />
                            <span className="text-xs">Deposit: ₱{depositUsed.toFixed(2)}</span>
                          </div>
                        );
                      }

                      if (bill.paid && amountPaid > 0) {
                        return (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <DollarSign className="w-3 h-3" aria-hidden="true" />
                            <span className="text-xs font-medium">{paymentMethod}: ₱{amountPaid.toFixed(2)}</span>
                          </div>
                        );
                      }

                      return <span className="text-gray-400">-</span>;
                    })()}
                  </td>
                  <td className="px-3 md:px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(bill)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Edit"
                        aria-label={`Edit bill for ${room?.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(bill.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete"
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
                <td colSpan="13" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
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

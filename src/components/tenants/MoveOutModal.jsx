import { useState, useEffect } from 'react';
import { X, LogOut, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Move Out Modal Component
 * Handles tenant move-out process with refund calculation
 */
function MoveOutModal({
  isOpen,
  onClose,
  tenant,
  room,
  onConfirmMoveOut,
}) {
  const [moveOutDate, setMoveOutDate] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);
  const [deductions, setDeductions] = useState('');
  const [notes, setNotes] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && tenant) {
      const today = new Date().toISOString().split('T')[0];
      setMoveOutDate(today);
      setRefundAmount(tenant.securityDeposit || 0);
      setDeductions('');
      setNotes('');
    }
  }, [isOpen, tenant]);

  if (!isOpen || !tenant) return null;

  const securityDeposit = tenant.securityDeposit || 0;
  const earlyTerminationPenalty = tenant.earlyTerminationPenalty || 0;

  // Calculate if tenant is leaving early (before 6 months)
  const moveInDate = tenant.moveInDate ? new Date(tenant.moveInDate) : null;
  const selectedMoveOutDate = moveOutDate ? new Date(moveOutDate) : new Date();
  const monthsStayed = moveInDate
    ? Math.floor((selectedMoveOutDate - moveInDate) / (1000 * 60 * 60 * 24 * 30))
    : 0;
  const isEarlyTermination = monthsStayed < 6;

  const handleDeductionsChange = (value) => {
    const deductionAmount = parseFloat(value) || 0;
    setDeductions(value);
    const calculatedRefund = Math.max(0, securityDeposit - deductionAmount);
    setRefundAmount(calculatedRefund);
  };

  const handleRefundChange = (value) => {
    setRefundAmount(parseFloat(value) || 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onConfirmMoveOut(tenant, {
      moveOutDate,
      refundAmount,
      deductions: parseFloat(deductions) || 0,
      notes,
      isEarlyTermination,
      monthsStayed,
    });
    onClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 bg-red-50 dark:bg-red-900/20">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 flex items-center gap-2">
            <LogOut className="w-5 h-5" />
            Move Out Tenant
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Tenant Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Tenant:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{tenant.fullName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Room:</span>
                <span className="font-medium text-gray-900 dark:text-white">{room?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Move-in Date:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {tenant.moveInDate ? new Date(tenant.moveInDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Months Stayed:</span>
                <span className={`font-medium ${isEarlyTermination ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {monthsStayed} months {isEarlyTermination && '(Early Termination)'}
                </span>
              </div>
            </div>

            {/* Early Termination Warning */}
            {isEarlyTermination && earlyTerminationPenalty > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Early Termination Penalty Applies
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Tenant is leaving before 6 months. A penalty of {formatCurrency(earlyTerminationPenalty)} may apply.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Move Out Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Move-Out Date
              </label>
              <input
                type="date"
                value={moveOutDate}
                onChange={(e) => setMoveOutDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Deposit & Refund Calculation */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Deposit & Refund Calculation
              </h4>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Security Deposit:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {formatCurrency(securityDeposit)}
                </span>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Deductions (damages, unpaid bills, etc.):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={securityDeposit}
                    value={deductions}
                    onChange={(e) => handleDeductionsChange(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Refund Amount to Tenant:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={refundAmount}
                    onChange={(e) => handleRefundChange(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border-2 border-green-500 dark:border-green-600 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-bold text-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Add any notes about this move-out (reason, condition of room, etc.)..."
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Move-Out Summary
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Move-Out Date:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {moveOutDate ? new Date(moveOutDate).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Total Deductions:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {formatCurrency(parseFloat(deductions) || 0)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="font-semibold text-gray-900 dark:text-white">Refund to Tenant:</span>
                  <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                    {formatCurrency(refundAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Confirm Move Out
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MoveOutModal;

import { useState, useEffect } from 'react';
import { X, DollarSign, CheckCircle } from 'lucide-react';

/**
 * Payment Popup Component
 * Quick popup for recording partial or full payments
 */
function PaymentPopup({
  isOpen,
  onClose,
  bill,
  roomName,
  total,
  amountPaid,
  remainingBalance,
  onSubmitPayment,
}) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [error, setError] = useState('');

  // Reset form when popup opens/closes or bill changes
  useEffect(() => {
    if (isOpen) {
      setPaymentAmount('');
      setError('');
    }
  }, [isOpen, bill?.id]);

  if (!isOpen || !bill) return null;

  const handleAmountChange = (value) => {
    setPaymentAmount(value);
    setError('');
  };

  const handleQuickAmount = (amount) => {
    setPaymentAmount(amount.toString());
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const amount = parseFloat(paymentAmount);

    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    if (amount > remainingBalance) {
      setError(`Amount cannot exceed remaining balance (₱${remainingBalance.toFixed(2)})`);
      return;
    }

    onSubmitPayment(bill.id, amount);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Record Payment
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Bill Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Room:</span>
              <span className="font-medium text-gray-900 dark:text-white">{roomName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Due Date:</span>
              <span className="font-medium text-gray-900 dark:text-white">{bill.dueDate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Total Bill:</span>
              <span className="font-medium text-gray-900 dark:text-white">₱{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Amount Paid:</span>
              <span className="font-medium text-green-600 dark:text-green-400">₱{amountPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t dark:border-gray-600">
              <span className="font-semibold text-gray-700 dark:text-gray-200">Remaining:</span>
              <span className="font-bold text-red-600 dark:text-red-400">₱{remainingBalance.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max={remainingBalance}
                value={paymentAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="0.00"
                autoFocus
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickAmount(remainingBalance)}
              className="flex-1 py-2 px-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm font-medium flex items-center justify-center gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              Pay Full (₱{remainingBalance.toFixed(2)})
            </button>
            {remainingBalance > 0 && (
              <button
                type="button"
                onClick={() => handleQuickAmount(Math.round(remainingBalance / 2 * 100) / 100)}
                className="flex-1 py-2 px-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
              >
                Pay Half (₱{(remainingBalance / 2).toFixed(2)})
              </button>
            )}
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
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaymentPopup;

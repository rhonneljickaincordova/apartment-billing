import { useState, useEffect, useRef } from 'react';
import { X, DollarSign, CheckCircle, Upload, Trash2, Plus, Minus } from 'lucide-react';

/**
 * Payment Popup Component
 * Quick popup for recording partial or full payments with multiple payment methods
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
  const [paymentMethods, setPaymentMethods] = useState([
    { method: 'Cash', amount: '', proofImages: [] }
  ]);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const fileInputRefs = useRef([]);

  // Reset form when popup opens/closes or bill changes
  useEffect(() => {
    if (isOpen) {
      setPaymentMethods([{ method: 'Cash', amount: '', proofImages: [] }]);
      setError('');
      setNotes('');
    }
  }, [isOpen, bill?.id]);

  if (!isOpen || !bill) return null;

  const handleMethodChange = (index, field, value) => {
    const newMethods = [...paymentMethods];
    newMethods[index][field] = value;
    setPaymentMethods(newMethods);
    setError('');
  };

  const handleAddMethod = () => {
    setPaymentMethods([...paymentMethods, { method: 'Cash', amount: '', proofImages: [] }]);
  };

  const handleRemoveMethod = (index) => {
    if (paymentMethods.length > 1) {
      const newMethods = paymentMethods.filter((_, i) => i !== index);
      setPaymentMethods(newMethods);
    }
  };

  const handleImageUpload = (index, e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newMethods = [...paymentMethods];
        newMethods[index].proofImages = [...(newMethods[index].proofImages || []), reader.result];
        setPaymentMethods(newMethods);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (methodIndex, imageIndex) => {
    const newMethods = [...paymentMethods];
    newMethods[methodIndex].proofImages = newMethods[methodIndex].proofImages.filter((_, i) => i !== imageIndex);
    setPaymentMethods(newMethods);
  };

  const getTotalAmount = () => {
    return paymentMethods.reduce((sum, method) => {
      const amount = parseFloat(method.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const handleQuickAmount = () => {
    const newMethods = [...paymentMethods];
    newMethods[0].amount = remainingBalance.toString();
    setPaymentMethods(newMethods);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const totalPayment = getTotalAmount();

    if (totalPayment <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    if (totalPayment > remainingBalance) {
      setError(`Total amount (₱${totalPayment.toFixed(2)}) cannot exceed remaining balance (₱${remainingBalance.toFixed(2)})`);
      return;
    }

    // Validate that each method with amount > 0 is properly filled
    for (const method of paymentMethods) {
      const amount = parseFloat(method.amount) || 0;
      if (amount > 0 && !method.method) {
        setError('Please select a payment method for all entries');
        return;
      }
    }

    // Filter out empty payment methods
    const validMethods = paymentMethods.filter(m => parseFloat(m.amount) > 0);

    onSubmitPayment(bill.id, totalPayment, {
      paymentMethods: validMethods,
      notes: notes
    });
    onClose();
  };

  const totalPaymentAmount = getTotalAmount();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
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
                <span className="text-gray-600 dark:text-gray-300">Already Paid:</span>
                <span className="font-medium text-green-600 dark:text-green-400">₱{amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t dark:border-gray-600">
                <span className="font-semibold text-gray-700 dark:text-gray-200">Remaining:</span>
                <span className="font-bold text-red-600 dark:text-red-400">₱{remainingBalance.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Payment Methods
                </label>
                <button
                  type="button"
                  onClick={handleQuickAmount}
                  className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  Pay Full
                </button>
              </div>

              {paymentMethods.map((payment, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3">
                  <div className="flex gap-3">
                    {/* Payment Method Selector */}
                    <div className="flex-1">
                      <select
                        value={payment.method}
                        onChange={(e) => handleMethodChange(index, 'method', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Cash">Cash</option>
                        <option value="GCash">GCash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>

                    {/* Amount Input */}
                    <div className="flex-1">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={payment.amount}
                          onChange={(e) => handleMethodChange(index, 'amount', e.target.value)}
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Remove Button */}
                    {paymentMethods.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMethod(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Image Upload for GCash/Bank Transfer */}
                  {(payment.method === 'GCash' || payment.method === 'Bank Transfer') && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(index, e)}
                        className="hidden"
                        id={`file-upload-${index}`}
                        ref={el => fileInputRefs.current[index] = el}
                      />
                      <label
                        htmlFor={`file-upload-${index}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Proof of Payment
                      </label>
                      {payment.proofImages && payment.proofImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {payment.proofImages.map((image, imgIndex) => (
                            <div key={imgIndex} className="relative">
                              <img
                                src={image}
                                alt={`Proof ${imgIndex + 1}`}
                                className="w-20 h-20 object-cover rounded border border-gray-300 dark:border-gray-600"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index, imgIndex)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Add Payment Method Button */}
              <button
                type="button"
                onClick={handleAddMethod}
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Payment Method
              </button>
            </div>

            {/* Total Payment Display */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700 dark:text-gray-200">Total Payment:</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">₱{totalPaymentAmount.toFixed(2)}</span>
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                rows="2"
                placeholder="Add any notes about this payment..."
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
            )}

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
                Record Payment (₱{totalPaymentAmount.toFixed(2)})
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PaymentPopup;

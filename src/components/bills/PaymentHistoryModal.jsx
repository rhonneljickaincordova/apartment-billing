import { useState, useRef } from 'react';
import { X, DollarSign, Calendar, CreditCard, FileText, Image, Clock, Edit2, Check, Upload, Trash2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Plus, RefreshCw, AlertTriangle, Printer } from 'lucide-react';

/**
 * Image Lightbox Component
 * Displays images in a fullscreen overlay with zoom and navigation
 */
function ImageLightbox({ images, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setZoom(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 0.5));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = images[currentIndex];
    link.download = `proof-of-payment-${currentIndex + 1}.png`;
    link.click();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 transition-colors z-10"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-lg px-4 py-2 z-10">
        <button
          onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
          className="p-2 text-white hover:text-gray-300 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <span className="text-white text-sm min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
        <button
          onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
          className="p-2 text-white hover:text-gray-300 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-gray-500 mx-2" />
        <button
          onClick={(e) => { e.stopPropagation(); handleDownload(); }}
          className="p-2 text-white hover:text-gray-300 transition-colors"
          title="Download"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation - Previous */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="absolute left-4 p-3 text-white hover:text-gray-300 bg-black/30 hover:bg-black/50 rounded-full transition-colors"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Image */}
      <div
        className="max-w-[90vw] max-h-[85vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[currentIndex]}
          alt={`Proof of Payment ${currentIndex + 1}`}
          className="transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        />
      </div>

      {/* Navigation - Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="absolute right-4 p-3 text-white hover:text-gray-300 bg-black/30 hover:bg-black/50 rounded-full transition-colors"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 rounded-lg px-4 py-2 text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

/**
 * Payment History Modal Component
 * Displays payment history for a bill including payment methods and proof images
 * Allows editing payment records
 */
function PaymentHistoryModal({
  isOpen,
  onClose,
  bill,
  roomName,
  total,
  amountPaid,
  onUpdatePayment,
  onAddMissingRecord,
  onRecordRefund,
  onPrintReceipt,
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [lightboxImages, setLightboxImages] = useState(null);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [newRecordForm, setNewRecordForm] = useState({ method: 'Cash', amount: '', notes: '' });
  const [refundForm, setRefundForm] = useState({ method: 'Cash', amount: '', reason: '' });
  const fileInputRef = useRef(null);

  if (!isOpen || !bill) return null;

  const handleOpenLightbox = (images, index = 0) => {
    setLightboxImages(images);
    setLightboxInitialIndex(index);
  };

  const handleCloseLightbox = () => {
    setLightboxImages(null);
    setLightboxInitialIndex(0);
  };

  const paymentHistory = bill.paymentHistory || [];

  // Calculate if there's unrecorded payment amount
  const recordedTotal = paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0);
  const unrecordedAmount = amountPaid - recordedTotal;

  const handleAddMissingRecord = async () => {
    if (!onAddMissingRecord || !newRecordForm.amount) return;
    const amount = parseFloat(newRecordForm.amount);
    if (amount <= 0) return;

    await onAddMissingRecord(bill.id, {
      amount,
      paymentMethods: [{ method: newRecordForm.method, amount, proofImages: [] }],
      notes: newRecordForm.notes || 'Retroactive payment record',
      isRetroactive: true,
    });
    setShowAddRecord(false);
    setNewRecordForm({ method: 'Cash', amount: '', notes: '' });
  };

  const handleRecordRefund = async () => {
    if (!onRecordRefund || !refundForm.amount) return;
    const amount = parseFloat(refundForm.amount);
    if (amount <= 0) return;

    await onRecordRefund(bill.id, {
      amount,
      method: refundForm.method,
      reason: refundForm.reason || 'Refund to tenant',
    });
    setShowRefundForm(false);
    setRefundForm({ method: 'Cash', amount: '', reason: '' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'GCash':
        return <span className="text-blue-500 font-bold text-xs">G</span>;
      case 'Bank Transfer':
        return <CreditCard className="w-4 h-4 text-purple-500" />;
      default:
        return <DollarSign className="w-4 h-4 text-green-500" />;
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'GCash':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'Bank Transfer':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      default:
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    }
  };

  const handleStartEdit = (index, payment) => {
    setEditingIndex(index);
    setEditForm({
      paymentMethods: payment.paymentMethods?.map(m => ({ ...m, proofImages: [...(m.proofImages || [])] })) || [{ method: 'Cash', amount: payment.amount, proofImages: [] }],
      notes: payment.notes || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleSaveEdit = async () => {
    if (editingIndex === null || !editForm || !onUpdatePayment) return;

    const result = await onUpdatePayment(bill.id, editingIndex, {
      paymentMethods: editForm.paymentMethods,
      notes: editForm.notes,
    });

    if (result.success) {
      setEditingIndex(null);
      setEditForm(null);
    }
  };

  const handleMethodChange = (methodIndex, field, value) => {
    const newMethods = [...editForm.paymentMethods];
    newMethods[methodIndex][field] = value;
    setEditForm({ ...editForm, paymentMethods: newMethods });
  };

  const handleImageUpload = (methodIndex, e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newMethods = [...editForm.paymentMethods];
        newMethods[methodIndex].proofImages = [...(newMethods[methodIndex].proofImages || []), reader.result];
        setEditForm({ ...editForm, paymentMethods: newMethods });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (methodIndex, imageIndex) => {
    const newMethods = [...editForm.paymentMethods];
    newMethods[methodIndex].proofImages = newMethods[methodIndex].proofImages.filter((_, i) => i !== imageIndex);
    setEditForm({ ...editForm, paymentMethods: newMethods });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Payment History
          </h3>
          <div className="flex items-center gap-2">
            {/* Print Receipt button - only show when fully paid */}
            {amountPaid >= total && onPrintReceipt && (
              <button
                onClick={() => onPrintReceipt(bill)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
            <div className="flex justify-between text-sm pt-2 border-t dark:border-gray-600">
              <span className="font-semibold text-gray-700 dark:text-gray-200">Total Paid:</span>
              <span className="font-bold text-green-600 dark:text-green-400">₱{amountPaid.toFixed(2)}</span>
            </div>
            {/* Show remaining balance if not fully paid */}
            {amountPaid < total && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Remaining:</span>
                <span className="font-medium text-red-600 dark:text-red-400">₱{(total - amountPaid).toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Warning for unrecorded payments */}
          {unrecordedAmount > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                    Unrecorded Payment: ₱{unrecordedAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    There's a payment amount without a record. Add a record to track how it was paid.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {unrecordedAmount > 0 && onAddMissingRecord && (
              <button
                onClick={() => {
                  setNewRecordForm({ method: 'Cash', amount: unrecordedAmount.toString(), notes: '' });
                  setShowAddRecord(true);
                  setShowRefundForm(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Missing Record
              </button>
            )}
            {amountPaid > 0 && onRecordRefund && (
              <button
                onClick={() => {
                  setRefundForm({ method: 'Cash', amount: '', reason: '' });
                  setShowRefundForm(true);
                  setShowAddRecord(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Record Refund
              </button>
            )}
          </div>

          {/* Add Missing Record Form */}
          {showAddRecord && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 space-y-3">
              <h5 className="font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Payment Record
              </h5>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Method</label>
                  <select
                    value={newRecordForm.method}
                    onChange={(e) => setNewRecordForm({ ...newRecordForm, method: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="Cash">Cash</option>
                    <option value="GCash">GCash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₱</span>
                    <input
                      type="number"
                      value={newRecordForm.amount}
                      onChange={(e) => setNewRecordForm({ ...newRecordForm, amount: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <input
                  type="text"
                  value={newRecordForm.notes}
                  onChange={(e) => setNewRecordForm({ ...newRecordForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="e.g., Payment from last month"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowAddRecord(false)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMissingRecord}
                  className="px-3 py-1.5 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Add Record
                </button>
              </div>
            </div>
          )}

          {/* Refund Form */}
          {showRefundForm && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-3">
              <h5 className="font-medium text-red-800 dark:text-red-200 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Record Refund
              </h5>
              <p className="text-xs text-red-600 dark:text-red-400">
                This will reduce the total paid amount and create a refund record.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Refund Method</label>
                  <select
                    value={refundForm.method}
                    onChange={(e) => setRefundForm({ ...refundForm, method: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="Cash">Cash</option>
                    <option value="GCash">GCash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₱</span>
                    <input
                      type="number"
                      value={refundForm.amount}
                      onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
                      max={amountPaid}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                <input
                  type="text"
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="e.g., Overpayment, Billing adjustment"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowRefundForm(false)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecordRefund}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Record Refund
                </button>
              </div>
            </div>
          )}

          {/* Payment History List */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              Payment Records ({paymentHistory.length})
            </h4>

            {paymentHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No payment records found.
              </div>
            ) : (
              <div className="space-y-3">
                {paymentHistory.map((payment, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3"
                  >
                    {editingIndex === index ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Editing Payment - {formatDate(payment.date)}
                          </span>
                          <span className="font-bold text-green-600 dark:text-green-400">
                            ₱{(Number(payment.amount) || 0).toFixed(2)}
                          </span>
                        </div>

                        {/* Editable Payment Methods */}
                        {editForm.paymentMethods.map((method, methodIndex) => (
                          <div key={methodIndex} className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex gap-3">
                              <select
                                value={method.method}
                                onChange={(e) => handleMethodChange(methodIndex, 'method', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value="Cash">Cash</option>
                                <option value="GCash">GCash</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                              </select>
                              <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₱</span>
                                <input
                                  type="number"
                                  value={method.amount}
                                  onChange={(e) => handleMethodChange(methodIndex, 'amount', parseFloat(e.target.value) || 0)}
                                  className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                            </div>

                            {/* Image Upload */}
                            {(method.method === 'GCash' || method.method === 'Bank Transfer') && (
                              <div className="space-y-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => handleImageUpload(methodIndex, e)}
                                  className="hidden"
                                  id={`edit-file-upload-${methodIndex}`}
                                  ref={fileInputRef}
                                />
                                <label
                                  htmlFor={`edit-file-upload-${methodIndex}`}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                  <Upload className="w-3 h-3" />
                                  Add Proof Image
                                </label>
                                {method.proofImages && method.proofImages.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {method.proofImages.map((image, imgIndex) => (
                                      <div key={imgIndex} className="relative">
                                        <img
                                          src={image}
                                          alt={`Proof ${imgIndex + 1}`}
                                          className="w-16 h-16 object-cover rounded border border-gray-300 dark:border-gray-600"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveImage(methodIndex, imgIndex)}
                                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                                        >
                                          <Trash2 className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Notes */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                          <textarea
                            value={editForm.notes}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                            rows="2"
                            placeholder="Add notes..."
                          />
                        </div>

                        {/* Edit Actions */}
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        {/* Payment Header */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatDate(payment.date)}
                            </span>
                            {payment.timestamp && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                at {formatTime(payment.timestamp)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-green-600 dark:text-green-400">
                              ₱{(Number(payment.amount) || 0).toFixed(2)}
                            </span>
                            {onUpdatePayment && (
                              <button
                                onClick={() => handleStartEdit(index, payment)}
                                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                title="Edit payment"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Payment Methods */}
                        {payment.paymentMethods && payment.paymentMethods.length > 0 && (
                          <div className="space-y-2">
                            {payment.paymentMethods.map((method, methodIndex) => (
                              <div key={methodIndex} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(method.method)}`}>
                                    {getMethodIcon(method.method)}
                                    {method.method}
                                  </span>
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    ₱{(Number(method.amount) || 0).toFixed(2)}
                                  </span>
                                </div>

                                {/* Proof Images */}
                                {method.proofImages && method.proofImages.length > 0 && (
                                  <div className="pl-2">
                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
                                      <Image className="w-3 h-3" />
                                      Proof of Payment ({method.proofImages.length})
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {method.proofImages.map((image, imgIndex) => (
                                        <button
                                          key={imgIndex}
                                          onClick={() => handleOpenLightbox(method.proofImages, imgIndex)}
                                          className="block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                                        >
                                          <img
                                            src={image}
                                            alt={`Proof ${imgIndex + 1}`}
                                            className="w-24 h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600 hover:opacity-80 hover:border-blue-500 transition-all cursor-pointer"
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Notes */}
                        {payment.notes && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded p-2 italic">
                            "{payment.notes}"
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxImages && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxInitialIndex}
          onClose={handleCloseLightbox}
        />
      )}
    </div>
  );
}

export default PaymentHistoryModal;

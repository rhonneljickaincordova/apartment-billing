import { useRef, useState } from 'react';
import { X, Share2, Printer, CheckCircle } from 'lucide-react';

/**
 * Payment Receipt Modal Component
 * Displays a printable payment acceptance/receipt when a bill is fully paid
 */
function PaymentReceiptModal({ isOpen, onClose, bill, room, tenant, totalAmount }) {
  const printRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen || !bill) return null;

  const paidDate = bill.paidDate || new Date().toISOString().split('T')[0];

  // Generate receipt number from bill ID and paid date
  const receiptNumber = `RCP-${bill.id?.slice(-6).toUpperCase() || '000000'}-${paidDate.replace(/-/g, '')}`;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get payment methods from payment history
  const getPaymentMethodsSummary = () => {
    if (!bill.paymentHistory || bill.paymentHistory.length === 0) {
      return [{ method: 'Cash', amount: totalAmount }];
    }

    // Aggregate all payment methods across all payments
    const methodTotals = {};
    bill.paymentHistory.forEach(payment => {
      if (payment.paymentMethods) {
        payment.paymentMethods.forEach(pm => {
          if (!methodTotals[pm.method]) {
            methodTotals[pm.method] = 0;
          }
          methodTotals[pm.method] += Number(pm.amount) || 0;
        });
      } else {
        // Legacy payment without paymentMethods array
        if (!methodTotals['Cash']) {
          methodTotals['Cash'] = 0;
        }
        methodTotals['Cash'] += Number(payment.amount) || 0;
      }
    });

    return Object.entries(methodTotals).map(([method, amount]) => ({ method, amount }));
  };

  const paymentMethods = getPaymentMethodsSummary();

  // Generate receipt as image using canvas
  const generateReceiptImage = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const element = printRef.current;

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png', 1.0);
    });
  };

  // Handle native share
  const handleShare = async () => {
    setIsSharing(true);

    try {
      const imageBlob = await generateReceiptImage();
      const fileName = `Receipt-${room?.name || 'Room'}-${paidDate}.png`;
      const file = new File([imageBlob], fileName, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Payment Receipt - ${room?.name || 'Room'}`,
          text: `Payment receipt for ${room?.name || 'Room'} - Amount: ₱${totalAmount.toFixed(2)} - Receipt #${receiptNumber}`,
          files: [file],
        });
      } else if (navigator.share) {
        // Fallback: share without file (text only)
        await navigator.share({
          title: `Payment Receipt - ${room?.name || 'Room'}`,
          text: `Payment receipt for ${room?.name || 'Room'}\nAmount: ₱${totalAmount.toFixed(2)}\nReceipt #${receiptNumber}`,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        const url = URL.createObjectURL(imageBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('Receipt downloaded! You can now share it manually.');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        alert('Failed to share. Please try again.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Handle print
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const content = printRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${room?.name || 'Room'}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            @media print {
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="receipt-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
            Payment Receipt
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Share2 className={`w-4 h-4 ${isSharing ? 'animate-pulse' : ''}`} />
              {isSharing ? 'Preparing...' : 'Send'}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div ref={printRef} className="bg-white p-6 rounded-lg">
            {/* Receipt Header */}
            <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">PAYMENT RECEIPT</h1>
              <p className="text-sm text-gray-500">Official Acknowledgment of Payment</p>
            </div>

            {/* Receipt Number */}
            <div className="text-center mb-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Receipt Number</p>
              <p className="font-mono font-bold text-gray-900">{receiptNumber}</p>
            </div>

            {/* Receipt Details */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Tenant:</span>
                <span className="font-semibold text-gray-900">{tenant?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Room:</span>
                <span className="font-semibold text-gray-900">{room?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Bill Due Date:</span>
                <span className="font-semibold text-gray-900">{formatDate(bill.dueDate)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Date Paid:</span>
                <span className="font-semibold text-gray-900">{formatDate(paidDate)}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Payment Method(s):</p>
              <div className="space-y-2">
                {paymentMethods.map((pm, index) => (
                  <div key={index} className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{pm.method}</span>
                    <span className="font-medium text-gray-900">₱{pm.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Amount */}
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Total Amount Paid:</span>
                <span className="text-2xl font-bold text-green-600">₱{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="text-center mb-6">
              <span className="inline-block px-4 py-2 bg-green-500 text-white rounded-full text-sm font-bold">
                FULLY PAID
              </span>
            </div>

            {/* Footer */}
            <div className="text-center text-gray-500 text-xs border-t border-gray-200 pt-4">
              <p>Generated on {formatDateTime(new Date().toISOString())}</p>
              <p className="mt-1">Thank you for your payment!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentReceiptModal;

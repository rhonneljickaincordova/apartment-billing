import { useRef, useState } from 'react';
import { X, Share2 } from 'lucide-react';

/**
 * Bill Print Modal Component
 * Displays a bill preview in a modal with share functionality
 */
function BillPrintModal({ isOpen, onClose, bill, room, getBillTotal }) {
  const printRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen || !bill) return null;

  const total = getBillTotal(bill);
  const isPaid = bill.paid || false;
  const paidDate = bill.paidDate || null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formattedDueDate = formatDate(bill.dueDate);
  const formattedPaidDate = paidDate ? formatDate(paidDate) : null;

  // Generate bill as image using canvas
  const generateBillImage = async () => {
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
      const imageBlob = await generateBillImage();
      const fileName = `Bill-${room?.name || 'Room'}-${bill.dueDate}.png`;
      const file = new File([imageBlob], fileName, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Monthly Bill - ${room?.name || 'Room'}`,
          text: `Bill for ${room?.name || 'Room'} - Due: ${formattedDueDate} - Total: ₱${total.toFixed(2)}`,
          files: [file],
        });
      } else if (navigator.share) {
        // Fallback: share without file (text only)
        await navigator.share({
          title: `Monthly Bill - ${room?.name || 'Room'}`,
          text: `Bill for ${room?.name || 'Room'}\nDue Date: ${formattedDueDate}\nTotal: ₱${total.toFixed(2)}\nStatus: ${isPaid ? 'PAID' : 'NOT PAID'}`,
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
        alert('Image downloaded! You can now share it manually.');
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
      aria-labelledby="bill-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="bill-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
            Bill Preview
          </h2>
          <div className="flex items-center gap-2">
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

        {/* Bill Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div ref={printRef} className="bg-white p-6 rounded-lg">
            {/* Bill Header */}
            <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">MONTHLY BILL</h1>
              <span
                className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
                  isPaid
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {isPaid ? '✓ PAID' : 'NOT PAID'}
              </span>
            </div>

            {/* Paid Date */}
            {isPaid && formattedPaidDate && (
              <div className="text-center mb-4 p-3 bg-green-100 rounded-lg text-green-800 font-semibold text-sm">
                Payment Received: {formattedPaidDate}
              </div>
            )}

            {/* Bill Info */}
            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-gray-700">
                <span className="font-semibold">Room:</span>
                <span>{room?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span className="font-semibold">Due Date:</span>
                <span>{formattedDueDate}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span className="font-semibold">Number of Persons:</span>
                <span>{room?.persons || 1}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-0 border-t border-gray-200">
              <div className="flex justify-between py-3 border-b border-gray-200 text-gray-700">
                <span>Rent</span>
                <span>₱{(bill.rentBill || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200 text-gray-700">
                <span>WiFi</span>
                <span>₱{(bill.wifiBill || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200 text-gray-700">
                <span>Water</span>
                <span>₱{(bill.waterBill || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200 text-gray-700">
                <span>Electricity ({bill.lastMonthReading} → {bill.currentReading})</span>
                <span>₱{(bill.electricityBill || 0).toFixed(2)}</span>
              </div>
              {bill.airconCleaningBill > 0 && (
                <div className="flex justify-between py-3 border-b border-gray-200 text-gray-700">
                  <span>Aircon Cleaning</span>
                  <span>₱{(bill.airconCleaningBill || 0).toFixed(2)}</span>
                </div>
              )}
              {/* Total */}
              <div className="flex justify-between py-4 border-t-2 border-b-2 border-gray-900 mt-3 text-xl font-bold text-gray-900">
                <span>TOTAL</span>
                <span>₱{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-gray-500 text-sm border-t border-gray-200 pt-4">
              <p>Generated on {new Date().toLocaleDateString()}</p>
              <p>Thank you for your payment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BillPrintModal;

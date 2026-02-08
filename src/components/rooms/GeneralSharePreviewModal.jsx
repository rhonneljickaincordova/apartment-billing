import { useState } from 'react';
import { X, Copy, Check, Share2, Megaphone } from 'lucide-react';

/**
 * General Share Preview Modal Component
 * Shows a preview of the general share message for all vacant rooms before sharing
 */
function GeneralSharePreviewModal({ isOpen, onClose, message, vacantCount, onShare }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareAndClose = () => {
    onShare();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Megaphone className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Share All Vacant Rooms
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {vacantCount} vacant room{vacantCount !== 1 ? 's' : ''} will be included
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Message Preview
              </span>
              <button
                onClick={handleCopyText}
                className={`flex items-center gap-1 text-sm px-2 py-1 rounded transition-colors ${
                  copied
                    ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Text
                  </>
                )}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-sans bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 max-h-96 overflow-y-auto">
              {message}
            </pre>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            This message will be copied to your clipboard. Paste it in your Facebook group or page.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleShareAndClose}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Copy & Open Facebook
          </button>
        </div>
      </div>
    </div>
  );
}

export default GeneralSharePreviewModal;

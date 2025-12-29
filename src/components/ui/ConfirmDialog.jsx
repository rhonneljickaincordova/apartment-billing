import { AlertTriangle, Trash2, Info } from 'lucide-react';
import Modal from './Modal';

/**
 * Confirm Dialog Component
 * Replaces browser confirm() with a styled modal
 */
function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default', // 'default', 'danger', 'warning'
}) {
  const variants = {
    default: {
      icon: Info,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      confirmBtn: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
    danger: {
      icon: Trash2,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      confirmBtn: 'bg-red-500 hover:bg-red-600 text-white',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-500',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      confirmBtn: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    },
  };

  const config = variants[variant] || variants.default;
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        {/* Icon */}
        <div className={`mx-auto w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center mb-4`}>
          <Icon className={`w-6 h-6 ${config.iconColor}`} aria-hidden="true" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg transition-colors ${config.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;

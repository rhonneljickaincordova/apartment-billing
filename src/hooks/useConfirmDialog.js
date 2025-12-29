import { useState, useCallback } from 'react';

/**
 * Custom hook for managing confirm dialog state
 */
export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'default',
    onConfirm: () => {},
  });

  /**
   * Show the confirm dialog
   * @param {string} title - Dialog title
   * @param {string} message - Dialog message
   * @param {function} onConfirm - Callback when confirmed
   * @param {string} variant - Dialog variant ('default', 'danger', 'warning')
   */
  const showConfirm = useCallback((title, message, onConfirm, variant = 'default') => {
    setDialogState({
      isOpen: true,
      title,
      message,
      variant,
      onConfirm,
    });
  }, []);

  /**
   * Close the confirm dialog
   */
  const closeConfirm = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  /**
   * Helper to create a delete confirmation
   * @param {string} itemName - Name of item being deleted
   * @param {function} onConfirm - Callback when confirmed
   * @param {string} additionalMessage - Additional warning message
   */
  const showDeleteConfirm = useCallback(
    (itemName, onConfirm, additionalMessage = '') => {
      showConfirm(
        'Delete Confirmation',
        `Are you sure you want to delete "${itemName}"?${additionalMessage ? ' ' + additionalMessage : ''}`,
        onConfirm,
        'danger'
      );
    },
    [showConfirm]
  );

  /**
   * Helper to create a warning confirmation
   * @param {string} title - Dialog title
   * @param {string} message - Dialog message
   * @param {function} onConfirm - Callback when confirmed
   */
  const showWarningConfirm = useCallback(
    (title, message, onConfirm) => {
      showConfirm(title, message, onConfirm, 'warning');
    },
    [showConfirm]
  );

  return {
    // State
    isOpen: dialogState.isOpen,
    title: dialogState.title,
    message: dialogState.message,
    variant: dialogState.variant,
    onConfirm: dialogState.onConfirm,

    // Actions
    showConfirm,
    closeConfirm,
    showDeleteConfirm,
    showWarningConfirm,
  };
}

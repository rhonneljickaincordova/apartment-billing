import Modal from '../ui/Modal';

/**
 * Cleaning History Modal Component
 * Displays the cleaning history for a room
 */
function CleaningHistoryModal({ isOpen, onClose, roomName, history }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Cleaning History - ${roomName}`} size="md">
      {history && history.length > 0 ? (
        <div className="space-y-3">
          {history
            .slice()
            .reverse()
            .map((entry, index) => (
              <div key={entry.id || index} className="border-l-2 border-blue-500 pl-3 py-1">
                <p className="font-medium text-sm text-gray-900 dark:text-white">
                  Cleaned: {entry.cleanedDate}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Was due: {entry.previousDueDate}
                </p>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No cleaning history yet.</p>
      )}
    </Modal>
  );
}

export default CleaningHistoryModal;

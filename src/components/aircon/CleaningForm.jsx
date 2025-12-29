import { Wind, Save, X, Home, Clock, Calendar } from 'lucide-react';

/**
 * Cleaning Form Component
 * Handles creating and editing aircon cleaning schedules
 */
function CleaningForm({ form, errors, isEditing, rooms, onSave, onCancel, onUpdateField }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        <Wind className="w-5 h-5" />
        {isEditing ? 'Edit Cleaning Schedule' : 'Add Cleaning Schedule'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Home className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Room
          </label>
          <select
            value={form.roomId}
            onChange={(e) => onUpdateField('roomId', e.target.value)}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.roomId ? 'border-red-500' : ''
            }`}
            disabled={isEditing}
            aria-invalid={!!errors.roomId}
          >
            <option value="">Select Room</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
          {errors.roomId && <p className="text-red-500 text-xs mt-1">{errors.roomId}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Clock className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Cleaning Interval
          </label>
          <select
            value={form.cleaningInterval}
            onChange={(e) => onUpdateField('cleaningInterval', parseInt(e.target.value))}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value={1}>Every 1 month</option>
            <option value={2}>Every 2 months</option>
            <option value={3}>Every 3 months</option>
            <option value={6}>Every 6 months</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Last Cleaned
          </label>
          <input
            type="date"
            value={form.lastCleaned}
            onChange={(e) => onUpdateField('lastCleaned', e.target.value)}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.lastCleaned ? 'border-red-500' : ''
            }`}
            aria-invalid={!!errors.lastCleaned}
          />
          {errors.lastCleaned && <p className="text-red-500 text-xs mt-1">{errors.lastCleaned}</p>}
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={onSave}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isEditing ? 'Update' : 'Save'}
          </button>
          {isEditing && (
            <button
              onClick={onCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              aria-label="Cancel editing"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CleaningForm;

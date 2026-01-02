import { DollarSign, Save, X, Home, Calendar, Zap, CheckSquare, Wind } from 'lucide-react';

/**
 * Bill Form Component
 * Handles creating and editing bills
 */
function BillForm({ form, errors, isEditing, rooms, onSave, onCancel, onUpdateField }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        <DollarSign className="w-5 h-5" />
        {isEditing ? 'Edit Bill' : 'Create New Bill'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <Calendar className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Due Date
          </label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => onUpdateField('dueDate', e.target.value)}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.dueDate ? 'border-red-500' : ''
            }`}
            aria-invalid={!!errors.dueDate}
          />
          {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Zap className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Last Month Reading
          </label>
          <input
            type="number"
            placeholder="0"
            value={form.lastMonthReading}
            onChange={(e) => onUpdateField('lastMonthReading', parseFloat(e.target.value) || 0)}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.lastMonthReading ? 'border-red-500' : ''
            }`}
            aria-invalid={!!errors.lastMonthReading}
          />
          {errors.lastMonthReading && (
            <p className="text-red-500 text-xs mt-1">{errors.lastMonthReading}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Zap className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Current Reading
          </label>
          <input
            type="number"
            placeholder="0"
            value={form.currentReading}
            onChange={(e) => onUpdateField('currentReading', parseFloat(e.target.value) || 0)}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.currentReading ? 'border-red-500' : ''
            }`}
            aria-invalid={!!errors.currentReading}
          />
          {errors.currentReading && (
            <p className="text-red-500 text-xs mt-1">{errors.currentReading}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Wind className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Aircon Cleaning
          </label>
          <div className="flex items-center h-[42px] px-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
            <input
              type="checkbox"
              id="includeAircon"
              checked={form.includeAirconCleaning || false}
              onChange={(e) => onUpdateField('includeAirconCleaning', e.target.checked)}
              className="w-4 h-4 mr-2"
            />
            <label htmlFor="includeAircon" className="text-gray-700 dark:text-gray-300">
              Include
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <CheckSquare className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Payment Status
          </label>
          <div className="flex items-center h-[42px] px-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
            <input
              type="checkbox"
              id="billPaid"
              checked={form.paid}
              onChange={(e) => onUpdateField('paid', e.target.checked)}
              className="w-4 h-4 mr-2"
            />
            <label htmlFor="billPaid" className="text-gray-700 dark:text-gray-300">
              Paid
            </label>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-6">
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
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default BillForm;

import { Plus, Save, X, Home, Users, DollarSign, CheckCircle } from 'lucide-react';

/**
 * Room Form Component
 * Handles creating and editing rooms
 */
function RoomForm({ form, errors, isEditing, onSave, onCancel, onUpdateField }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        <Plus className="w-5 h-5" />
        {isEditing ? 'Edit Room' : 'Add New Room'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Home className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Room Name
          </label>
          <input
            type="text"
            placeholder="e.g., Room 101"
            value={form.name}
            onChange={(e) => onUpdateField('name', e.target.value)}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.name ? 'border-red-500' : ''
            }`}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'room-name-error' : undefined}
          />
          {errors.name && (
            <p id="room-name-error" className="text-red-500 text-xs mt-1">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Users className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Number of Persons
          </label>
          <input
            type="number"
            placeholder="1"
            value={form.persons}
            onChange={(e) => onUpdateField('persons', parseInt(e.target.value) || 1)}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.persons ? 'border-red-500' : ''
            }`}
            min="1"
            aria-invalid={!!errors.persons}
          />
          {errors.persons && <p className="text-red-500 text-xs mt-1">{errors.persons}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Monthly Rent
          </label>
          <input
            type="number"
            placeholder="0"
            value={form.rent}
            onChange={(e) => onUpdateField('rent', parseFloat(e.target.value) || 0)}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.rent ? 'border-red-500' : ''
            }`}
            min="0"
            aria-invalid={!!errors.rent}
          />
          {errors.rent && <p className="text-red-500 text-xs mt-1">{errors.rent}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <CheckCircle className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) => onUpdateField('status', e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="occupied">Occupied</option>
            <option value="vacant">Vacant</option>
          </select>
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

export default RoomForm;

import { DollarSign, Save, X, Home, Calendar, Zap, CheckSquare, Wind, Wifi, Droplets, Wallet, AlertCircle } from 'lucide-react';

/**
 * Bill Form Component
 * Handles creating and editing bills
 */
function BillForm({ form, errors, isEditing, rooms, tenants, onSave, onCancel, onUpdateField, onRoomChange }) {
  const handleRoomChange = (e) => {
    const roomId = e.target.value;
    if (onRoomChange) {
      onRoomChange(roomId);
    } else {
      onUpdateField('roomId', roomId);
    }
  };

  // Get tenant for the selected room
  const selectedRoom = rooms.find(r => r.id === form.roomId);
  const tenant = tenants.find(t => t.roomId === form.roomId && t.isActive);

  // Check if deposit is available
  const hasDeposit = tenant && tenant.securityDeposit > 0 && !tenant.depositUsed;
  const depositAmount = tenant?.securityDeposit || 0;

  // Check if early termination penalty applies
  const hasPenalty = tenant && tenant.earlyTerminationPenalty > 0;
  const penaltyAmount = tenant?.earlyTerminationPenalty || 0;

  const handleApplyDeposit = (checked) => {
    onUpdateField('applyDeposit', checked);
    if (checked && hasDeposit) {
      onUpdateField('depositAmount', depositAmount);
    } else {
      onUpdateField('depositAmount', 0);
    }
  };

  const handleApplyPenalty = (checked) => {
    onUpdateField('applyPenalty', checked);
    if (checked && hasPenalty) {
      onUpdateField('penaltyAmount', penaltyAmount);
    } else {
      onUpdateField('penaltyAmount', 0);
    }
  };

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
            onChange={handleRoomChange}
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
            <Wifi className="w-4 h-4 inline mr-1" aria-hidden="true" />
            WiFi
          </label>
          <div className="flex items-center h-[42px] px-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
            <input
              type="checkbox"
              id="includeWifi"
              checked={form.includeWifi !== false}
              onChange={(e) => onUpdateField('includeWifi', e.target.checked)}
              className="w-4 h-4 mr-2"
            />
            <label htmlFor="includeWifi" className="text-gray-700 dark:text-gray-300">
              Include
            </label>
          </div>
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
            <Droplets className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Number of Mineral Water (Optional)
          </label>
          <input
            type="number"
            placeholder="0"
            value={form.mineralWaterCount || ''}
            onChange={(e) => onUpdateField('mineralWaterCount', parseFloat(e.target.value) || 0)}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            min="0"
          />
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

      {/* Security Deposit Section */}
      {form.roomId && tenant && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-blue-600" />
            Security Deposit
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">Tenant:</span>
              <span className="font-medium text-gray-900 dark:text-white">{tenant.fullName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">Deposit Amount:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                ₱{depositAmount.toFixed(2)}
              </span>
            </div>
            {hasDeposit ? (
              <>
                <div className="flex items-center gap-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                  <input
                    type="checkbox"
                    id="applyDeposit"
                    checked={form.applyDeposit || false}
                    onChange={(e) => handleApplyDeposit(e.target.checked)}
                    className="w-4 h-4"
                    disabled={isEditing && form.depositAmount > 0}
                  />
                  <label htmlFor="applyDeposit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Apply deposit to this bill (typically used for move-out/final bill)
                  </label>
                </div>
                {form.applyDeposit && (
                  <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      ✓ Deposit of ₱{depositAmount.toFixed(2)} will be applied as payment
                    </p>
                  </div>
                )}
              </>
            ) : tenant.depositUsed ? (
              <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Deposit has already been used
                </p>
              </div>
            ) : (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No deposit available for this tenant
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Early Termination Penalty Section */}
      {form.roomId && tenant && hasPenalty && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            Early Termination Penalty
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">Tenant:</span>
              <span className="font-medium text-gray-900 dark:text-white">{tenant.fullName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">Penalty Amount:</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                ₱{penaltyAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-red-200 dark:border-red-800">
              <input
                type="checkbox"
                id="applyPenalty"
                checked={form.applyPenalty || false}
                onChange={(e) => handleApplyPenalty(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="applyPenalty" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Deduct early termination penalty from this bill (tenant leaving before 6 months)
              </label>
            </div>
            {form.applyPenalty && (
              <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300">
                  ⚠ Penalty of ₱{penaltyAmount.toFixed(2)} will be added to this bill
                </p>
              </div>
            )}
          </div>
        </div>
      )}
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

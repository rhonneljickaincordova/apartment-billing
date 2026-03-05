import { User, Phone, Users, Heart, Save, X, Home, Calendar, Upload, Trash2, FileText, Zap, Droplets, Wifi, LogOut, DollarSign } from 'lucide-react';

// Move-out reason options (same as MoveOutModal)
const MOVE_OUT_REASONS = [
  { value: 'normal', label: 'Normal Move-Out', description: 'Tenant completed lease term or gave proper notice' },
  { value: 'early_termination', label: 'Early Termination', description: 'Tenant leaving before minimum stay period' },
  { value: 'emergency', label: 'Emergency', description: 'Unexpected circumstances requiring immediate move-out' },
  { value: 'eviction', label: 'Eviction', description: 'Tenant evicted due to violations or non-payment' },
  { value: 'contract_violation', label: 'Contract Violation', description: 'Tenant violated lease agreement terms' },
  { value: 'personal', label: 'Personal Reasons', description: 'Job relocation, family matters, etc.' },
  { value: 'other', label: 'Other', description: 'Other reason not listed above' },
];
import { useRef } from 'react';

/**
 * Tenant Form Component
 * Handles creating and editing tenants
 */
function TenantForm({
  form,
  errors,
  isEditing,
  rooms,
  settings,
  onSave,
  onCancel,
  onUpdateField,
  onAddImage,
  onRemoveImage
}) {
  const fileInputRef = useRef(null);

  // Helper to update custom rates
  const updateCustomRate = (rateKey, value) => {
    const newValue = value === '' ? null : parseFloat(value);
    onUpdateField('customRates', {
      ...form.customRates,
      [rateKey]: isNaN(newValue) ? null : newValue,
    });
  };

  // Helper to update move-out details
  const updateMoveOutDetails = (key, value) => {
    const currentDetails = form.moveOutDetails || {};
    onUpdateField('moveOutDetails', {
      ...currentDetails,
      [key]: value,
    });
  };

  // Handle move-out reason change
  const handleMoveOutReasonChange = (value) => {
    const reasonInfo = MOVE_OUT_REASONS.find(r => r.value === value);
    const currentDetails = form.moveOutDetails || {};
    onUpdateField('moveOutDetails', {
      ...currentDetails,
      moveOutReason: value,
      moveOutReasonLabel: reasonInfo?.label || 'Normal Move-Out',
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAddImage(reader.result);
      };
      reader.readAsDataURL(file);
    });
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        <User className="w-5 h-5" />
        {isEditing ? 'Edit Tenant' : 'Add New Tenant'}
      </h2>

      {/* Basic Information */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-1" aria-hidden="true" />
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter full name"
              value={form.fullName}
              onChange={(e) => onUpdateField('fullName', e.target.value)}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.fullName ? 'border-red-500' : ''
              }`}
              aria-invalid={!!errors.fullName}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-1" aria-hidden="true" />
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Enter phone number"
              value={form.phoneNumber}
              onChange={(e) => onUpdateField('phoneNumber', e.target.value)}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.phoneNumber ? 'border-red-500' : ''
              }`}
              aria-invalid={!!errors.phoneNumber}
            />
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Home className="w-4 h-4 inline mr-1" aria-hidden="true" />
              Assigned Room
            </label>
            <select
              value={form.roomId}
              onChange={(e) => onUpdateField('roomId', e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">No room assigned</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" aria-hidden="true" />
              Move-in Date
            </label>
            <input
              type="date"
              value={form.moveInDate}
              onChange={(e) => onUpdateField('moveInDate', e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
          <Users className="w-4 h-4 inline mr-1" aria-hidden="true" />
          Emergency Contact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-1" aria-hidden="true" />
              Contact Name
            </label>
            <input
              type="text"
              placeholder="Emergency contact name"
              value={form.emergencyContactName}
              onChange={(e) => onUpdateField('emergencyContactName', e.target.value)}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.emergencyContactName ? 'border-red-500' : ''
              }`}
              aria-invalid={!!errors.emergencyContactName}
            />
            {errors.emergencyContactName && (
              <p className="text-red-500 text-xs mt-1">{errors.emergencyContactName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-1" aria-hidden="true" />
              Contact Number
            </label>
            <input
              type="tel"
              placeholder="Emergency contact number"
              value={form.emergencyContactNumber}
              onChange={(e) => onUpdateField('emergencyContactNumber', e.target.value)}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.emergencyContactNumber ? 'border-red-500' : ''
              }`}
              aria-invalid={!!errors.emergencyContactNumber}
            />
            {errors.emergencyContactNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.emergencyContactNumber}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Heart className="w-4 h-4 inline mr-1" aria-hidden="true" />
              Relationship
            </label>
            <input
              type="text"
              placeholder="e.g., Parent, Spouse, Sibling"
              value={form.relationship}
              onChange={(e) => onUpdateField('relationship', e.target.value)}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.relationship ? 'border-red-500' : ''
              }`}
              aria-invalid={!!errors.relationship}
            />
            {errors.relationship && (
              <p className="text-red-500 text-xs mt-1">{errors.relationship}</p>
            )}
          </div>
        </div>
      </div>

      {/* Lease Information */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
          <FileText className="w-4 h-4 inline mr-1" aria-hidden="true" />
          Lease Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" aria-hidden="true" />
              Lease Start Date
            </label>
            <input
              type="date"
              value={form.leaseStartDate || ''}
              onChange={(e) => onUpdateField('leaseStartDate', e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" aria-hidden="true" />
              Lease End Date
            </label>
            <input
              type="date"
              value={form.leaseEndDate || ''}
              onChange={(e) => onUpdateField('leaseEndDate', e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" aria-hidden="true" />
              Rent Due Day
            </label>
            <select
              value={form.rentDueDay || ''}
              onChange={(e) => onUpdateField('rentDueDay', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select day of month</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} day of the month
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Day of the month when rent is due
            </p>
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
          <FileText className="w-4 h-4 inline mr-1" aria-hidden="true" />
          Financial Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Advance Payment Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter advance payment"
              value={form.advancePayment ?? ''}
              onChange={(e) => onUpdateField('advancePayment', parseFloat(e.target.value) || 0)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              1 month advance rent collected upon move-in
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" aria-hidden="true" />
              Advance Payment Date
            </label>
            <input
              type="date"
              value={form.advancePaymentDate || ''}
              onChange={(e) => onUpdateField('advancePaymentDate', e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Date when advance payment was collected
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Security Deposit Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter security deposit"
              value={form.securityDeposit ?? ''}
              onChange={(e) => onUpdateField('securityDeposit', parseFloat(e.target.value) || 0)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Refundable deposit that can be applied to final bill
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Early Termination Penalty
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter penalty amount"
              value={form.earlyTerminationPenalty ?? ''}
              onChange={(e) => onUpdateField('earlyTerminationPenalty', parseFloat(e.target.value) || 0)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Amount forfeited if tenant terminates lease early (before 6 months)
            </p>
          </div>
        </div>
      </div>

      {/* Custom Utility Rates */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
          <Zap className="w-4 h-4 inline mr-1" aria-hidden="true" />
          Custom Utility Rates (Optional)
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Leave blank to use global rates from Settings. Custom rates completely replace global settings for this tenant.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Zap className="w-4 h-4 inline mr-1" aria-hidden="true" />
              Electricity Rate (per kWh)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder={`Global: ₱${settings?.electricityRate || 15}`}
              value={form.customRates?.electricityRate ?? ''}
              onChange={(e) => updateCustomRate('electricityRate', e.target.value)}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.customElectricityRate ? 'border-red-500' : ''
              }`}
              aria-invalid={!!errors.customElectricityRate}
            />
            {form.customRates?.electricityRate !== null && form.customRates?.electricityRate !== undefined && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Using custom rate</p>
            )}
            {errors.customElectricityRate && (
              <p className="text-red-500 text-xs mt-1">{errors.customElectricityRate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Droplets className="w-4 h-4 inline mr-1" aria-hidden="true" />
              Water Rate (per person)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder={`Global: ₱${settings?.waterRate || 100}`}
              value={form.customRates?.waterRate ?? ''}
              onChange={(e) => updateCustomRate('waterRate', e.target.value)}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.customWaterRate ? 'border-red-500' : ''
              }`}
              aria-invalid={!!errors.customWaterRate}
            />
            {form.customRates?.waterRate !== null && form.customRates?.waterRate !== undefined && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Using custom rate</p>
            )}
            {errors.customWaterRate && (
              <p className="text-red-500 text-xs mt-1">{errors.customWaterRate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Wifi className="w-4 h-4 inline mr-1" aria-hidden="true" />
              WiFi Rate (flat rate)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder={`Global: ₱${settings?.wifiRate || 500}`}
              value={form.customRates?.wifiRate ?? ''}
              onChange={(e) => updateCustomRate('wifiRate', e.target.value)}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.customWifiRate ? 'border-red-500' : ''
              }`}
              aria-invalid={!!errors.customWifiRate}
            />
            {form.customRates?.wifiRate !== null && form.customRates?.wifiRate !== undefined && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Using custom rate</p>
            )}
            {errors.customWifiRate && (
              <p className="text-red-500 text-xs mt-1">{errors.customWifiRate}</p>
            )}
          </div>
        </div>
      </div>

      {/* Move-Out Details - Only show when editing a moved-out tenant */}
      {isEditing && form.moveOutDate && (
        <div className="mb-6">
          <h3 className="text-md font-medium mb-4 text-red-700 dark:text-red-300 border-b border-red-200 dark:border-red-700 pb-2">
            <LogOut className="w-4 h-4 inline mr-1" aria-hidden="true" />
            Move-Out Details
          </h3>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-600 dark:text-red-400">
              This tenant has moved out. You can update the move-out details below.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" aria-hidden="true" />
                Move-Out Date
              </label>
              <input
                type="date"
                value={form.moveOutDate || ''}
                onChange={(e) => onUpdateField('moveOutDate', e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-1" aria-hidden="true" />
                Move-Out Reason
              </label>
              <select
                value={form.moveOutDetails?.moveOutReason || 'normal'}
                onChange={(e) => handleMoveOutReasonChange(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {MOVE_OUT_REASONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {MOVE_OUT_REASONS.find(r => r.value === (form.moveOutDetails?.moveOutReason || 'normal'))?.description}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" aria-hidden="true" />
                Refund Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter refund amount"
                value={form.moveOutDetails?.refundAmount ?? ''}
                onChange={(e) => updateMoveOutDetails('refundAmount', parseFloat(e.target.value) || 0)}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Amount refunded to tenant upon move-out
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" aria-hidden="true" />
                Deductions
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter deductions"
                value={form.moveOutDetails?.deductions ?? ''}
                onChange={(e) => updateMoveOutDetails('deductions', parseFloat(e.target.value) || 0)}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Deductions for damages or unpaid bills
              </p>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Move-Out Notes
            </label>
            <textarea
              value={form.moveOutDetails?.notes || ''}
              onChange={(e) => updateMoveOutDetails('notes', e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows="2"
              placeholder="Add any notes about the move-out..."
            />
          </div>
        </div>
      )}

      {/* Valid ID Images */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
          <Upload className="w-4 h-4 inline mr-1" aria-hidden="true" />
          Valid ID Pictures
        </h3>
        <div className="space-y-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="validIdUpload"
            />
            <label
              htmlFor="validIdUpload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload ID Images
            </label>
          </div>
          {form.validIdImages && form.validIdImages.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {form.validIdImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Valid ID ${index + 1}`}
                    className="w-32 h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    onClick={() => onRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
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

export default TenantForm;

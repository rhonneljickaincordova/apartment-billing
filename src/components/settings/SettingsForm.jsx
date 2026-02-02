import { useState } from 'react';
import { Save, Droplet, Zap, Wifi, Wind, Download, Droplets, Settings } from 'lucide-react';
import { CleaningForm, CleaningCard, CleaningHistoryModal } from '../aircon';

/**
 * Settings Form Component
 * Handles rate settings, export options, and aircon cleaning management
 */
function SettingsForm({
  settings,
  onUpdateSetting,
  onSave,
  onExportCSV,
  onExportJSON,
  // Aircon props
  cleaningSchedules,
  cleaningForm,
  cleaningErrors,
  isEditingCleaning,
  rooms,
  getRoomById,
  selectedHistory,
  onSaveSchedule,
  onEditSchedule,
  onDeleteSchedule,
  onCancelCleaning,
  onUpdateCleaningField,
  onOpenHistory,
  onCloseHistory,
  onMarkCleaned,
  isScheduleOverdue,
  isScheduleDueSoon,
}) {
  const [isRateSettingsExpanded, setIsRateSettingsExpanded] = useState(false);

  return (
    <div className="space-y-6">
      {/* Rate Settings - Collapsible */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <button
          onClick={() => setIsRateSettingsExpanded(!isRateSettingsExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Rate Settings</h2>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
              isRateSettingsExpanded ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isRateSettingsExpanded && (
          <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Droplet className="w-4 h-4 inline mr-1" aria-hidden="true" />
              Water Rate (per person)
            </label>
            <input
              type="number"
              value={settings.waterRate}
              onChange={(e) => onUpdateSetting('waterRate', parseFloat(e.target.value) || 0)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Zap className="w-4 h-4 inline mr-1" aria-hidden="true" />
              Electricity Rate (per kWh)
            </label>
            <input
              type="number"
              value={settings.electricityRate}
              onChange={(e) => onUpdateSetting('electricityRate', parseFloat(e.target.value) || 0)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Wifi className="w-4 h-4 inline mr-1" aria-hidden="true" />
              WiFi Rate (flat rate)
            </label>
            <input
              type="number"
              value={settings.wifiRate}
              onChange={(e) => onUpdateSetting('wifiRate', parseFloat(e.target.value) || 0)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Wind className="w-4 h-4 inline mr-1" aria-hidden="true" />
              Aircon Cleaning Rate
            </label>
            <input
              type="number"
              value={settings.airconCleaningRate || 0}
              onChange={(e) => onUpdateSetting('airconCleaningRate', parseFloat(e.target.value) || 0)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Droplets className="w-4 h-4 inline mr-1" aria-hidden="true" />
              Mineral Water Rate
            </label>
            <input
              type="number"
              value={settings.mineralWaterRate || 0}
              onChange={(e) => onUpdateSetting('mineralWaterRate', parseFloat(e.target.value) || 0)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              min="0"
            />
            </div>
            </div>
            <button
              onClick={onSave}
              className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        )}
      </div>

      {/* Aircon Cleaning Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Aircon Cleaning Schedule</h2>
        <CleaningForm
          form={cleaningForm}
          errors={cleaningErrors}
          isEditing={isEditingCleaning}
          rooms={rooms}
          onSave={onSaveSchedule}
          onCancel={onCancelCleaning}
          onUpdateField={onUpdateCleaningField}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {cleaningSchedules.map((schedule) => (
            <CleaningCard
              key={schedule.id}
              schedule={schedule}
              roomName={getRoomById(schedule.roomId)?.name || 'Unknown Room'}
              isOverdue={isScheduleOverdue(schedule)}
              isDueSoon={isScheduleDueSoon(schedule)}
              onViewHistory={() => onOpenHistory(schedule)}
              onEdit={() => onEditSchedule(schedule)}
              onDelete={() => onDeleteSchedule(schedule.id)}
              onMarkCleaned={() => onMarkCleaned(schedule.roomId)}
            />
          ))}
          {cleaningSchedules.length === 0 && (
            <div className="col-span-full bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center text-gray-500 dark:text-gray-400">
              No cleaning schedules added yet. Add your first schedule above.
            </div>
          )}
        </div>
        <CleaningHistoryModal
          isOpen={!!selectedHistory}
          onClose={onCloseHistory}
          roomName={getRoomById(selectedHistory?.roomId)?.name || 'Unknown'}
          history={selectedHistory?.history}
        />
      </div>

      {/* Data Export */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Data Export</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Export your data for backup or analysis purposes.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onExportCSV}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Bills to CSV
          </button>
          <button
            onClick={onExportJSON}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export All Data (JSON)
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsForm;

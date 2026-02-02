import { useState } from 'react';
import { Save, Droplet, Zap, Wifi, Wind, Download, Droplets, Settings, Share2, Users, CheckCircle, XCircle } from 'lucide-react';
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
  const [isFacebookExpanded, setIsFacebookExpanded] = useState(false);
  const [isFacebookConnected, setIsFacebookConnected] = useState(false);
  const [fbGroups, setFbGroups] = useState([]);
  const [isLoadingFb, setIsLoadingFb] = useState(false);

  const handleFacebookConnect = async () => {
    setIsLoadingFb(true);
    try {
      // TODO: Implement Facebook OAuth flow
      // This will need Facebook App ID and proper OAuth implementation
      alert('Facebook integration coming soon! This will connect to Facebook API to fetch your groups.');
      // Simulated connection for demo
      setTimeout(() => {
        setIsFacebookConnected(true);
        setFbGroups([
          { id: '1', name: 'Apartment Rentals Davao', memberCount: 1234 },
          { id: '2', name: 'Room for Rent - Philippines', memberCount: 5678 },
        ]);
        setIsLoadingFb(false);
      }, 1000);
    } catch (error) {
      console.error('Facebook connection error:', error);
      setIsLoadingFb(false);
    }
  };

  const handleFacebookDisconnect = () => {
    setIsFacebookConnected(false);
    setFbGroups([]);
  };

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

      {/* Facebook Integration - Collapsible */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <button
          onClick={() => setIsFacebookExpanded(!isFacebookExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Share2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Facebook Integration</h2>
            {isFacebookConnected && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                <CheckCircle className="w-3 h-3" />
                Connected
              </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
              isFacebookExpanded ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isFacebookExpanded && (
          <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
            <div className="mt-6">
              {!isFacebookConnected ? (
                <div className="text-center py-8">
                  <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Connect to Facebook
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Connect your Facebook account to access your groups and share bills or announcements directly.
                  </p>
                  <button
                    onClick={handleFacebookConnect}
                    disabled={isLoadingFb}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Share2 className="w-5 h-5" />
                    {isLoadingFb ? 'Connecting...' : 'Connect Facebook'}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Facebook Connected
                      </span>
                    </div>
                    <button
                      onClick={handleFacebookDisconnect}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Disconnect
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                        Your Facebook Groups
                      </h3>
                    </div>
                    {fbGroups.length > 0 ? (
                      <div className="space-y-3">
                        {fbGroups.map((group) => (
                          <div
                            key={group.id}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-650 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Users className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {group.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {group.memberCount.toLocaleString()} members
                                </p>
                              </div>
                            </div>
                            <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                              Select
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No groups found. Make sure you have joined Facebook groups.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
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

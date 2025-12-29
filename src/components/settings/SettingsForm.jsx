import { Save, Droplet, Zap, Wifi, Download } from 'lucide-react';

/**
 * Settings Form Component
 * Handles rate settings and export options
 */
function SettingsForm({ settings, onUpdateSetting, onSave, onExportCSV, onExportJSON }) {
  return (
    <div className="space-y-6">
      {/* Rate Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Rate Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </div>
        <button
          onClick={onSave}
          className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>
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

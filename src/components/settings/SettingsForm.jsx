import { useState } from 'react';
import { Save, Droplet, Zap, Wifi, Wind, Download, Droplets, Settings, Share2, RotateCcw, Info, MapPin, Phone, Eye, X, Image } from 'lucide-react';
import { CleaningForm, CleaningCard, CleaningHistoryModal } from '../aircon';
import MediaGallery from './MediaGallery';

/**
 * Generate preview for single room template
 */
function generateRoomPreview(template, sampleRoom = { name: 'Room 101', rent: 5500, persons: 2 }, settings = {}) {
  return template
    .replace(/{roomName}/g, sampleRoom.name)
    .replace(/{rent}/g, (sampleRoom.rent || 0).toLocaleString())
    .replace(/{persons}/g, sampleRoom.persons || 1)
    .replace(/{waterRate}/g, settings.waterRate || 100)
    .replace(/{electricityRate}/g, settings.electricityRate || 15)
    .replace(/{wifiRate}/g, settings.wifiRate || 500)
    .replace(/{location}/g, settings.location || 'Contact for location')
    .replace(/{contactNumber}/g, settings.contactNumber || 'Contact for details');
}

/**
 * Generate preview for general template
 */
function generateGeneralPreview(template, vacantRooms, settings) {
  // Group rooms by rent price and count them
  const rentGroups = {};
  vacantRooms.forEach((room) => {
    const rent = room.rent || 0;
    if (!rentGroups[rent]) {
      rentGroups[rent] = 0;
    }
    rentGroups[rent]++;
  });

  // Generate the vacant rooms list (sorted by rent descending)
  const vacantRoomsList = Object.entries(rentGroups)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([rent, count]) => `${Number(rent).toLocaleString()} / Month - ${count} Unit${count > 1 ? 's' : ''} Available`)
    .join('\n');

  return template
    .replace(/{vacantRoomsList}/g, vacantRoomsList || 'No vacant rooms available')
    .replace(/{waterRate}/g, settings.waterRate || 100)
    .replace(/{electricityRate}/g, settings.electricityRate || 15)
    .replace(/{wifiRate}/g, settings.wifiRate || 500)
    .replace(/{location}/g, settings.location || 'Contact for location')
    .replace(/{contactNumber}/g, settings.contactNumber || 'Contact for details');
}

const DEFAULT_SHARE_TEMPLATE = `🏠 ROOM FOR RENT

📍 {roomName}
💰 Monthly Rent: ₱{rent}
👥 Good for {persons} person(s)

✨ Amenities:
• WiFi included
• Water included
• Electricity (metered)

📞 Contact us for viewing!

#RoomForRent #Apartment #ForRent`;

const DEFAULT_GENERAL_TEMPLATE = `PERMISSION TO POST ADMIN
Studio Type Apartment for Rent 🏡

{vacantRoomsList}

- 1 month advance
- 1 month deposit
- with own sink, cr and ac
- with own electric meter
- Good for 1 to 2 person per unit
- Water {waterRate}/person
- Electricity {electricityRate} pesos/kilowatt
- Internet/Wifi {wifiRate}/room
- PLDT and Globe
- Good for work from home set-up
- No Children Allowed
- No Pets Allowed
- Preferred long term renters/borders.

Location:
{location}

Contact Number:
{contactNumber}

PM for more details ☺️`;

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
  const [isShareTemplateExpanded, setIsShareTemplateExpanded] = useState(false);
  const [isGeneralTemplateExpanded, setIsGeneralTemplateExpanded] = useState(false);
  const [isMediaGalleryExpanded, setIsMediaGalleryExpanded] = useState(false);
  const [showRoomPreview, setShowRoomPreview] = useState(false);
  const [showGeneralPreview, setShowGeneralPreview] = useState(false);

  // Local state for templates to prevent cursor jumping
  const [localShareTemplate, setLocalShareTemplate] = useState(settings.shareTemplate || DEFAULT_SHARE_TEMPLATE);
  const [localGeneralTemplate, setLocalGeneralTemplate] = useState(settings.generalShareTemplate || DEFAULT_GENERAL_TEMPLATE);

  // Get vacant rooms for preview
  const vacantRooms = rooms?.filter((room) => room.status === 'vacant') || [];

  const handleResetTemplate = () => {
    setLocalShareTemplate(DEFAULT_SHARE_TEMPLATE);
    onUpdateSetting('shareTemplate', DEFAULT_SHARE_TEMPLATE);
  };

  const handleResetGeneralTemplate = () => {
    setLocalGeneralTemplate(DEFAULT_GENERAL_TEMPLATE);
    onUpdateSetting('generalShareTemplate', DEFAULT_GENERAL_TEMPLATE);
  };

  const handleSaveShareTemplate = () => {
    onUpdateSetting('shareTemplate', localShareTemplate);
    onSave();
  };

  const handleSaveGeneralTemplate = () => {
    onUpdateSetting('generalShareTemplate', localGeneralTemplate);
    onSave();
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

      {/* Share Template - Collapsible */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <button
          onClick={() => setIsShareTemplateExpanded(!isShareTemplateExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Share2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Share Template</h2>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
              isShareTemplateExpanded ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isShareTemplateExpanded && (
          <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
            <div className="mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Customize the message template used when sharing vacant rooms to Facebook.
              </p>

              {/* Available placeholders */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Available Placeholders:</p>
                    <div className="flex flex-wrap gap-2">
                      <code className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">{'{roomName}'}</code>
                      <code className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">{'{rent}'}</code>
                      <code className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">{'{persons}'}</code>
                      <code className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">{'{waterRate}'}</code>
                      <code className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">{'{electricityRate}'}</code>
                      <code className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">{'{wifiRate}'}</code>
                      <code className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">{'{location}'}</code>
                      <code className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">{'{contactNumber}'}</code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template textarea */}
              <textarea
                value={localShareTemplate}
                onChange={(e) => setLocalShareTemplate(e.target.value)}
                className="w-full h-64 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
                placeholder="Enter your share template..."
              />

              {/* Preview */}
              {showRoomPreview && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview (Sample Data)</span>
                    <button
                      onClick={() => setShowRoomPreview(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-sans">
                    {generateRoomPreview(localShareTemplate, undefined, settings)}
                  </pre>

                  {/* Media Preview */}
                  {settings.media?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Attached Media ({settings.media.length} files)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {settings.media.slice(0, 6).map((item) => (
                          <div key={item.id} className="w-16 h-16 rounded overflow-hidden bg-gray-200 dark:bg-gray-600">
                            {item.type === 'image' ? (
                              <img src={item.data} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                        {settings.media.length > 6 && (
                          <div className="w-16 h-16 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
                            +{settings.media.length - 6}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => setShowRoomPreview(!showRoomPreview)}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {showRoomPreview ? 'Hide Preview' : 'Preview'}
                </button>
                <button
                  onClick={handleSaveShareTemplate}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Template
                </button>
                <button
                  onClick={handleResetTemplate}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* General Share Template - Collapsible */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <button
          onClick={() => setIsGeneralTemplateExpanded(!isGeneralTemplateExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Share2 className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">General Post Template</h2>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
              isGeneralTemplateExpanded ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isGeneralTemplateExpanded && (
          <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
            <div className="mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Create a general post template for sharing all vacant rooms at once to Facebook groups.
              </p>

              {/* Contact & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={settings.contactNumber || ''}
                    onChange={(e) => onUpdateSetting('contactNumber', e.target.value)}
                    placeholder="e.g., 09276161535"
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={settings.location || ''}
                    onChange={(e) => onUpdateSetting('location', e.target.value)}
                    placeholder="e.g., Bangkal, Davao City"
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              {/* Available placeholders */}
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Available Placeholders:</p>
                    <div className="flex flex-wrap gap-2">
                      <code className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded">{'{vacantRoomsList}'}</code>
                      <code className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded">{'{waterRate}'}</code>
                      <code className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded">{'{electricityRate}'}</code>
                      <code className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded">{'{wifiRate}'}</code>
                      <code className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded">{'{location}'}</code>
                      <code className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded">{'{contactNumber}'}</code>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      Note: {'{vacantRoomsList}'} will auto-generate a list of all vacant rooms with their rent.
                    </p>
                  </div>
                </div>
              </div>

              {/* Template textarea */}
              <textarea
                value={localGeneralTemplate}
                onChange={(e) => setLocalGeneralTemplate(e.target.value)}
                className="w-full h-80 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
                placeholder="Enter your general share template..."
              />

              {/* Preview */}
              {showGeneralPreview && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Preview {vacantRooms.length > 0 ? `(${vacantRooms.length} vacant room${vacantRooms.length !== 1 ? 's' : ''})` : '(No vacant rooms)'}
                    </span>
                    <button
                      onClick={() => setShowGeneralPreview(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-sans max-h-96 overflow-y-auto">
                    {generateGeneralPreview(
                      localGeneralTemplate,
                      vacantRooms.length > 0 ? vacantRooms : [{ name: 'Sample Room', rent: 5500, persons: 2 }],
                      settings
                    )}
                  </pre>

                  {/* Media Preview */}
                  {settings.media?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Attached Media ({settings.media.length} files)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {settings.media.slice(0, 8).map((item) => (
                          <div key={item.id} className="w-16 h-16 rounded overflow-hidden bg-gray-200 dark:bg-gray-600">
                            {item.type === 'image' ? (
                              <img src={item.data} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                        {settings.media.length > 8 && (
                          <div className="w-16 h-16 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
                            +{settings.media.length - 8}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => setShowGeneralPreview(!showGeneralPreview)}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {showGeneralPreview ? 'Hide Preview' : 'Preview'}
                </button>
                <button
                  onClick={handleSaveGeneralTemplate}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Template
                </button>
                <button
                  onClick={handleResetGeneralTemplate}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Media Gallery - Collapsible */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <button
          onClick={() => setIsMediaGalleryExpanded(!isMediaGalleryExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Image className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Media Gallery</h2>
            {settings.media?.length > 0 && (
              <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full">
                {settings.media.length} files
              </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
              isMediaGalleryExpanded ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isMediaGalleryExpanded && (
          <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
            <div className="mt-6">
              <MediaGallery
                media={settings.media || []}
                onUpdateMedia={(media) => onUpdateSetting('media', media)}
                onSave={onSave}
              />
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

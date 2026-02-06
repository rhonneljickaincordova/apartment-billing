import { useCallback } from 'react';
import { validateSettings } from '../utils/validation';
import { settingsService } from '../services/firestore';
import { useFirestoreDocument } from './useFirestore';

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

const DEFAULT_SETTINGS = {
  waterRate: 100,
  electricityRate: 15,
  wifiRate: 500,
  airconCleaningRate: 400,
  shareTemplate: DEFAULT_SHARE_TEMPLATE,
  generalShareTemplate: DEFAULT_GENERAL_TEMPLATE,
  contactNumber: '',
  location: '',
  media: [], // Legacy - keeping for backwards compatibility
  mediaLibrary: [], // Global media library for reuse across rooms
};

/**
 * Custom hook for managing application settings
 * Handles settings persistence with Firestore
 */
export function useSettings() {
  const {
    data: firestoreSettings,
    loading,
    error: storageError,
    save
  } = useFirestoreDocument(settingsService, DEFAULT_SETTINGS);

  // Merge default settings with firestore settings
  const mergedSettings = { ...DEFAULT_SETTINGS, ...firestoreSettings };

  // Ensure mediaLibrary is always an array
  const settings = {
    ...mergedSettings,
    mediaLibrary: Array.isArray(mergedSettings.mediaLibrary) ? mergedSettings.mediaLibrary : [],
  };

  /**
   * Update a single setting
   * @param {string} key - Setting key
   * @param {any} value - New value
   */
  const updateSetting = useCallback(
    async (key, value) => {
      const newSettings = { ...settings, [key]: value };
      await save(newSettings);
    },
    [settings, save]
  );

  /**
   * Update multiple settings at once
   * @param {object} newSettings - Object with settings to update
   */
  const updateSettings = useCallback(
    async (newSettings) => {
      await save({ ...settings, ...newSettings });
    },
    [settings, save]
  );

  /**
   * Validate current settings
   * @returns {{ isValid: boolean, errors: object }}
   */
  const validate = useCallback(() => {
    return validateSettings(settings);
  }, [settings]);

  /**
   * Save settings (validates and persists)
   * @returns {{ success: boolean, message: string }}
   */
  const saveSettings = useCallback(async () => {
    const validation = validateSettings(settings);

    if (!validation.isValid) {
      return { success: false, message: 'Please enter valid rate values.', errors: validation.errors };
    }

    try {
      await save(settings);
      return { success: true, message: 'Settings saved successfully!' };
    } catch (error) {
      console.error('Error saving settings:', error);
      return { success: false, message: 'Failed to save settings.' };
    }
  }, [settings, save]);

  /**
   * Reset settings to defaults
   */
  const resetToDefaults = useCallback(async () => {
    await save(DEFAULT_SETTINGS);
  }, [save]);

  /**
   * Calculate water bill for a given number of persons
   * @param {number} persons - Number of persons
   * @returns {number}
   */
  const calculateWaterBill = useCallback(
    (persons) => {
      return (persons || 0) * settings.waterRate;
    },
    [settings.waterRate]
  );

  /**
   * Calculate electricity bill for meter readings
   * @param {number} lastReading - Last month reading
   * @param {number} currentReading - Current reading
   * @returns {number}
   */
  const calculateElectricityBill = useCallback(
    (lastReading, currentReading) => {
      const usage = Math.max(0, (currentReading || 0) - (lastReading || 0));
      return usage * settings.electricityRate;
    },
    [settings.electricityRate]
  );

  /**
   * Get WiFi bill (flat rate)
   * @returns {number}
   */
  const getWifiBill = useCallback(() => {
    return settings.wifiRate;
  }, [settings.wifiRate]);

  /**
   * Update media library
   * @param {array} mediaLibrary - Array of media items
   * @returns {{ success: boolean, message: string }}
   */
  const updateMediaLibrary = useCallback(
    async (mediaLibrary) => {
      try {
        await save({ ...settings, mediaLibrary });
        return { success: true, message: 'Media library updated!' };
      } catch (error) {
        console.error('Error updating media library:', error);
        return { success: false, message: 'Failed to update media library.' };
      }
    },
    [settings, save]
  );

  return {
    // State
    settings,
    storageError,
    loading,

    // Actions
    updateSetting,
    updateSettings,
    saveSettings,
    resetToDefaults,
    validate,
    updateMediaLibrary,

    // Calculators
    calculateWaterBill,
    calculateElectricityBill,
    getWifiBill,

    // Constants
    DEFAULT_SETTINGS,
  };
}

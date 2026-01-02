import { useCallback } from 'react';
import { validateSettings } from '../utils/validation';
import { settingsService } from '../services/firestore';
import { useFirestoreDocument } from './useFirestore';

const DEFAULT_SETTINGS = {
  waterRate: 100,
  electricityRate: 15,
  wifiRate: 500,
  airconCleaningRate: 400,
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
  const settings = { ...DEFAULT_SETTINGS, ...firestoreSettings };

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

    // Calculators
    calculateWaterBill,
    calculateElectricityBill,
    getWifiBill,

    // Constants
    DEFAULT_SETTINGS,
  };
}

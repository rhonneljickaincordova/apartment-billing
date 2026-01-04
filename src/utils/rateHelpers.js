/**
 * Rate Helper Utilities
 * Functions for resolving effective utility rates based on tenant custom rates
 */

/**
 * Get effective rates for a room based on tenant custom rates
 * If tenant has custom rates set, use those; otherwise fall back to global settings
 *
 * @param {string} roomId - The room ID to get rates for
 * @param {array} tenants - All tenants array
 * @param {object} globalSettings - Global settings object with default rates
 * @returns {object} - Effective rates { electricityRate, waterRate, wifiRate }
 */
export function getEffectiveRates(roomId, tenants, globalSettings) {
  // Find active tenant for this room
  const tenant = tenants.find(t => t.roomId === roomId && t.isActive !== false);

  // If no tenant or no custom rates, use global settings
  if (!tenant?.customRates) {
    return {
      electricityRate: globalSettings.electricityRate,
      waterRate: globalSettings.waterRate,
      wifiRate: globalSettings.wifiRate,
    };
  }

  // Merge custom rates with global (null/undefined means use global)
  const customRates = tenant.customRates;
  return {
    electricityRate: customRates.electricityRate ?? globalSettings.electricityRate,
    waterRate: customRates.waterRate ?? globalSettings.waterRate,
    wifiRate: customRates.wifiRate ?? globalSettings.wifiRate,
  };
}

/**
 * Check if a tenant has any custom rates set
 * @param {object} tenant - Tenant object
 * @returns {boolean} - True if tenant has at least one custom rate
 */
export function hasCustomRates(tenant) {
  if (!tenant?.customRates) return false;

  const { electricityRate, waterRate, wifiRate } = tenant.customRates;
  return (
    electricityRate !== null && electricityRate !== undefined ||
    waterRate !== null && waterRate !== undefined ||
    wifiRate !== null && wifiRate !== undefined
  );
}

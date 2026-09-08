/**
 * Date utility functions for the apartment billing app
 */

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string}
 */
export function getToday() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Calculate the next cleaning date based on interval
 * @param {Date|string} fromDate - Starting date
 * @param {number} monthsInterval - Number of months to add
 * @returns {string} - Date in YYYY-MM-DD format
 */
export function getNextCleaningDate(fromDate, monthsInterval = 3) {
  const date = new Date(fromDate);
  date.setMonth(date.getMonth() + monthsInterval);
  return date.toISOString().slice(0, 10);
}

/**
 * Add months to a YYYY-MM-DD date, clamping to the end of the target month.
 *
 * Works on the date parts rather than a Date object on purpose: constructing a
 * Date from 'YYYY-MM-DD' parses as UTC midnight but setMonth/getMonth read local
 * time, which shifts the result by a day in any timezone east of UTC. Clamping
 * also avoids setMonth's overflow, where 31 August + 6 months lands on 3 March
 * instead of 28 February.
 *
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {number} months - Months to add (may be negative)
 * @returns {string} - Date in YYYY-MM-DD format, or '' if the input is unusable
 */
export function addMonthsToDateString(dateString, months) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateString || '').trim());
  if (!match) return '';

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return '';

  const monthIndex = month - 1 + months;
  const targetYear = year + Math.floor(monthIndex / 12);
  const targetMonth = ((monthIndex % 12) + 12) % 12;

  // Day 0 of the following month is the last day of the target month
  const daysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const targetDay = Math.min(day, daysInTargetMonth);

  const pad = (value) => String(value).padStart(2, '0');
  return `${targetYear}-${pad(targetMonth + 1)}-${pad(targetDay)}`;
}

/**
 * Check if a date is overdue (before today)
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {boolean}
 */
export function isOverdue(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Check if a date is due soon (within specified days)
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {number} daysThreshold - Number of days to consider "soon"
 * @returns {boolean}
 */
export function isDueSoon(dateString, daysThreshold = 7) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilDue = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
  return daysUntilDue <= daysThreshold && daysUntilDue > 0;
}

/**
 * Check if a bill is due soon (within 2 days)
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {boolean}
 */
export function isBillDueSoon(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilDue = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
  return daysUntilDue <= 2 && daysUntilDue >= 0;
}

/**
 * Format a date string for display
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export function formatDate(dateString, options = {}) {
  if (!dateString) return '';
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

/**
 * Get the number of days until a date
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {number}
 */
export function getDaysUntil(dateString) {
  if (!dateString) return 0;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((date - today) / (1000 * 60 * 60 * 24));
}

/**
 * Get start and end of month for filtering
 * @param {number} year
 * @param {number} month - 0-indexed (0 = January)
 * @returns {{ start: string, end: string }}
 */
export function getMonthRange(year, month) {
  const start = new Date(year, month, 1).toISOString().slice(0, 10);
  const end = new Date(year, month + 1, 0).toISOString().slice(0, 10);
  return { start, end };
}

/**
 * Parse a date string safely
 * @param {string} dateString
 * @returns {Date|null}
 */
export function parseDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

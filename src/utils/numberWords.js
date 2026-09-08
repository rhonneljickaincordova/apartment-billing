/**
 * Spell a whole number for contract prose, where amounts and counts are
 * conventionally written as "six (6)" rather than bare digits.
 */

const ONES = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
];

const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/**
 * @param {number} value - Whole number to spell
 * @returns {string} - The number in words, or the digits if out of range
 */
export function numberToWords(value) {
  if (!Number.isInteger(value) || value < 0 || value > 99) return String(value);
  if (value < 20) return ONES[value];

  const tens = TENS[Math.floor(value / 10)];
  const ones = value % 10;
  return ones ? `${tens}-${ONES[ones]}` : tens;
}

/**
 * The "six (6)" form used throughout the lease.
 * @param {number} value
 * @returns {string}
 */
export function numberWithWords(value) {
  return `${numberToWords(value)} (${value})`;
}

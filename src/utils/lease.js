/**
 * Lease term helpers.
 *
 * The house minimum is a six-month stay — leaving before completing it forfeits
 * the early-termination penalty (see the Early Termination clause of the lease).
 * The lease end date therefore defaults to six months after the start date.
 */

import { addMonthsToDateString } from './dateHelpers';
import { numberWithWords } from './numberWords';

export const MINIMUM_LEASE_TERM_MONTHS = 6;

/**
 * The default lease end date for a given start date: the same day of the month,
 * six months on (31 August → 28 February, clamped).
 *
 * @param {string} leaseStartDate - Date in YYYY-MM-DD format
 * @returns {string} - Date in YYYY-MM-DD format, or '' if the start date is unusable
 */
export function getDefaultLeaseEndDate(leaseStartDate) {
  return addMonthsToDateString(leaseStartDate, MINIMUM_LEASE_TERM_MONTHS);
}

/**
 * Whether an end date is the untouched six-month default for its start date.
 * A blank end date counts as untouched — there is nothing to preserve.
 *
 * Used to decide if changing the start date may recompute the end date: a term
 * the user deliberately set to something else (a twelve-month lease, say) should
 * survive an edit to the start date.
 *
 * @param {string} leaseStartDate
 * @param {string} leaseEndDate
 * @returns {boolean}
 */
export function isDefaultLeaseEndDate(leaseStartDate, leaseEndDate) {
  if (!leaseEndDate) return true;
  return leaseEndDate === getDefaultLeaseEndDate(leaseStartDate);
}

/**
 * The lease term to print on the contract, resolved from the tenant record.
 *
 * Shared by the three contract renderers (print window, on-screen preview, PDF),
 * which previously each sourced this differently — one printed today's date, the
 * other two printed the move-in date, and none printed an end date at all.
 *
 * Both fields fall back, so tenants recorded before the lease dates existed still
 * print a sensible term:
 *   - start: the lease start date, else the move-in date
 *   - end:   the lease end date, else the six-month minimum from that start
 * A derived end date is a display fallback only — nothing is written back to the
 * tenant record.
 *
 * @param {object} tenant
 * @returns {{ startDate: string, endDate: string, isEndDateDerived: boolean }}
 */
export function getLeaseTermDates(tenant) {
  const startDate = tenant?.leaseStartDate || tenant?.moveInDate || '';
  const recordedEndDate = tenant?.leaseEndDate || '';
  const endDate = recordedEndDate || getDefaultLeaseEndDate(startDate);

  return {
    startDate,
    endDate,
    isEndDateDerived: !recordedEndDate && !!endDate,
  };
}

/**
 * The length of a lease in whole months, or null when the dates are not an exact
 * number of months apart (1 March to 20 September is neither six months nor
 * seven, and the contract should not claim either).
 *
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {number|null}
 */
export function getLeaseTermMonths(startDate, endDate) {
  if (!startDate || !endDate) return null;

  const start = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startDate);
  const end = /^(\d{4})-(\d{2})-(\d{2})$/.exec(endDate);
  if (!start || !end) return null;

  const months =
    (Number(end[1]) - Number(start[1])) * 12 + (Number(end[2]) - Number(start[2]));
  if (months <= 0) return null;

  // Confirm rather than trust the month arithmetic: this also accepts a term that
  // was clamped at a month end (31 August to 28 February is exactly six months).
  return addMonthsToDateString(startDate, months) === endDate ? months : null;
}

/**
 * The variable prose of the Term of Lease clause.
 *
 * Returns the dates separately from the text because each of the three contract
 * renderers highlights them with its own markup; everything that is words rather
 * than markup is built here so the three cannot drift.
 *
 * The wording adapts to the recorded term: a lease of exactly the minimum says so
 * in one breath, a longer lease states its own length and notes the minimum
 * separately, and a term that is not a whole number of months omits the length
 * rather than round it. The penalty sentence names the Early Termination clause
 * rather than numbering it, so inserting a clause cannot make it point elsewhere.
 *
 * @param {object} tenant
 * @returns {{ startDate: string, endDate: string, termMonths: number|null,
 *   termSuffix: string, penaltySentence: string }}
 */
export function getLeaseTermClause(tenant) {
  const { startDate, endDate } = getLeaseTermDates(tenant);
  const termMonths = getLeaseTermMonths(startDate, endDate);
  const minimum = numberWithWords(MINIMUM_LEASE_TERM_MONTHS);

  if (termMonths === MINIMUM_LEASE_TERM_MONTHS) {
    return {
      startDate,
      endDate,
      termMonths,
      termSuffix: `, a term of ${minimum} months, being the minimum stay required under this Agreement.`,
      penaltySentence:
        'Should the Lessee vacate before the end of this term, the Early Termination clause below shall apply.',
    };
  }

  return {
    startDate,
    endDate,
    termMonths,
    termSuffix: termMonths ? `, a term of ${numberWithWords(termMonths)} months.` : '.',
    penaltySentence:
      `The minimum stay required under this Agreement is ${minimum} months; should the Lessee ` +
      'vacate before completing it, the Early Termination clause below shall apply.',
  };
}

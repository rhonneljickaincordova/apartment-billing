/**
 * Lease term helpers.
 *
 * The house minimum is a six-month stay — leaving before completing it forfeits
 * the early-termination penalty (see the Early Termination clause of the lease).
 * The lease end date therefore defaults to six months after the start date.
 */

import { addMonthsToDateString } from './dateHelpers';

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

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

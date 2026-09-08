/**
 * Move-in bill helpers.
 *
 * A move-in bill (`bill.type === 'moveIn'`) is the payment record for the advance
 * payment + security deposit collected when a tenant first moves in. It exists so
 * move-in money flows through the same bill → payment → receipt machinery as every
 * other payment — which is the only way to produce a printable/shareable receipt.
 *
 * The tenant document keeps `advancePayment` / `securityDeposit` as the source of
 * truth for balances: move-out and room transfer both reconcile against those
 * fields, and the reports have always read move-in money from them. The bill is a
 * record of the transaction, not a second balance — so every aggregation that
 * derives move-in money from the tenant record must skip these bills, or the same
 * pesos get counted twice. Use `excludeMoveInBills` at those call sites.
 */

export const MOVE_IN_BILL_TYPE = 'moveIn';

/** Marks the payment-history entry this module generates, so edits can replace it
 *  without clobbering entries the user added by hand. */
export const MOVE_IN_PAYMENT_SOURCE = 'moveIn';

export function isMoveInBill(bill) {
  return bill?.type === MOVE_IN_BILL_TYPE;
}

/**
 * Drop move-in bills from a bill list.
 * @param {array} bills
 * @returns {array}
 */
export function excludeMoveInBills(bills = []) {
  return bills.filter((bill) => !isMoveInBill(bill));
}

/**
 * Move-in amounts held on the tenant record.
 * @param {object} tenant
 * @returns {{ advance: number, deposit: number, total: number }}
 */
export function getMoveInAmounts(tenant) {
  const advance = Number(tenant?.advancePayment) || 0;
  const deposit = Number(tenant?.securityDeposit) || 0;
  return { advance, deposit, total: advance + deposit };
}

/**
 * Total for a move-in bill. The utility line items are all 0 — the real line items
 * are the advance payment and security deposit.
 * @param {object} bill
 * @returns {number}
 */
export function getMoveInBillTotal(bill) {
  if (bill?.totalAmount != null) return bill.totalAmount;
  return (bill?.advancePaymentAmount || 0) + (bill?.securityDepositAmount || 0);
}

/**
 * The date the move-in money changed hands. Falls back through the fields the
 * reports already use for this, so the bill lands in the same month they do.
 * @param {object} tenant
 * @returns {string} - yyyy-mm-dd
 */
export function getMoveInPaymentDate(tenant) {
  return (
    tenant?.advancePaymentDate ||
    tenant?.moveInDate ||
    new Date().toISOString().split('T')[0]
  );
}

/**
 * Build the auto-generated payment entry for a move-in bill.
 * Shape matches the entries `useBills.recordPayment` writes, so the receipt and
 * payment-history modals render it without a special case.
 */
function buildMoveInPaymentEntry({ total, paymentDate, paymentMethod }) {
  return {
    date: paymentDate,
    amount: total,
    paymentMethods: [{ method: paymentMethod, amount: total, proofImages: [] }],
    notes: 'Move-in payment (advance + security deposit)',
    timestamp: new Date().toISOString(),
    source: MOVE_IN_PAYMENT_SOURCE,
  };
}

/**
 * Merge a freshly built move-in payment entry into an existing history, replacing
 * any previous auto-generated entry and preserving manual ones (retroactive
 * records, refunds).
 * @param {array} existingHistory
 * @param {object} entry
 * @returns {array}
 */
export function mergeMoveInPaymentHistory(existingHistory = [], entry) {
  const manualEntries = existingHistory.filter((p) => p?.source !== MOVE_IN_PAYMENT_SOURCE);
  return [entry, ...manualEntries];
}

/**
 * Build the Firestore payload for a tenant's move-in bill.
 *
 * Utility fields are written as explicit zeros so the generic bill table, filters
 * and totals treat it like any other bill instead of tripping over undefined.
 *
 * @param {object} params
 * @param {object} params.tenant - Tenant data (advancePayment / securityDeposit / roomId)
 * @param {string} params.tenantId - Tenant document id
 * @param {array} [params.existingPaymentHistory] - History to merge into, when updating
 * @param {string} [params.paymentMethod] - Defaults to 'Cash'
 * @returns {object} - Bill payload (no server timestamps; the caller adds those)
 */
export function buildMoveInBillData({
  tenant,
  tenantId,
  existingPaymentHistory = [],
  paymentMethod = 'Cash',
}) {
  const { advance, deposit, total } = getMoveInAmounts(tenant);
  const paymentDate = getMoveInPaymentDate(tenant);

  const paymentHistory = mergeMoveInPaymentHistory(
    existingPaymentHistory,
    buildMoveInPaymentEntry({ total, paymentDate, paymentMethod })
  );

  // Manual entries can add to (retroactive record) or subtract from (refund) the
  // amount actually held, so settle the paid amount against the whole history.
  const amountPaid = paymentHistory.reduce((sum, p) => sum + (Number(p?.amount) || 0), 0);

  return {
    type: MOVE_IN_BILL_TYPE,
    roomId: tenant?.roomId || '',
    tenantId,
    dueDate: paymentDate,
    // Move-in line items
    advancePaymentAmount: advance,
    securityDepositAmount: deposit,
    totalAmount: total,
    // Zeroed utility fields — a move-in bill charges no rent or utilities.
    // lastMonthReading / currentReading are deliberately absent: the move-out and
    // transfer modals pick the room's previous meter reading off the most recent
    // bill carrying a non-null currentReading, and a 0 here would wipe that out.
    rentBill: 0,
    electricityBill: 0,
    waterBill: 0,
    wifiBill: 0,
    airconCleaningBill: 0,
    mineralWaterBill: 0,
    mineralWaterCount: 0,
    includeAirconCleaning: false,
    includeWifi: false,
    // Collected at move-in, so it is settled the moment it is created
    amountPaid,
    paid: amountPaid >= total,
    paidDate: amountPaid >= total ? paymentDate : null,
    paymentHistory,
  };
}

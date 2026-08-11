import { useState, useMemo } from 'react';
import { X, LogOut, Calendar, DollarSign, AlertCircle, CheckCircle, FileText, Zap } from 'lucide-react';
import { getEffectiveRates } from '../../utils/rateHelpers';

// Move-out reason options
const MOVE_OUT_REASONS = [
  { value: 'normal', label: 'Normal Move-Out', description: 'Tenant completed lease term or gave proper notice' },
  { value: 'early_termination', label: 'Early Termination', description: 'Tenant leaving before minimum stay period' },
  { value: 'emergency', label: 'Emergency', description: 'Unexpected circumstances requiring immediate move-out' },
  { value: 'eviction', label: 'Eviction', description: 'Tenant evicted due to violations or non-payment' },
  { value: 'contract_violation', label: 'Contract Violation', description: 'Tenant violated lease agreement terms' },
  { value: 'personal', label: 'Personal Reasons', description: 'Job relocation, family matters, etc.' },
  { value: 'other', label: 'Other', description: 'Other reason not listed above' },
];

/**
 * Move Out Modal Component
 * Handles tenant move-out with an inline final bill + refund calculation.
 * Submit is atomic — the parent's onConfirmMoveOut runs a Firestore writeBatch
 * that creates the final bill and updates the tenant in one commit.
 */
function MoveOutModal({
  isOpen,
  onClose,
  tenant,
  room,
  bills = [],
  tenants = [],
  settings = {},
  onConfirmMoveOut,
}) {
  // Auto-fill lastMonthReading from the most recent bill for this room (computed before state
  // so useState initializer can use it — modal remounts via key prop on tenant change).
  const previousReading = useMemo(() => {
    if (!tenant?.roomId) return 0;
    const roomBills = bills
      .filter((b) => b.roomId === tenant.roomId && b.currentReading != null)
      .sort((a, b) => new Date(b.dueDate || 0) - new Date(a.dueDate || 0));
    return roomBills[0]?.currentReading || 0;
  }, [bills, tenant]);

  const today = new Date().toISOString().split('T')[0];
  const [moveOutDate, setMoveOutDate] = useState(today);
  const [moveOutReason, setMoveOutReason] = useState('normal');
  const [deductions, setDeductions] = useState('');
  const [notes, setNotes] = useState('');
  const [applyPenalty, setApplyPenalty] = useState(false);

  // Final bill fields
  const [issueFinalBill, setIssueFinalBill] = useState(true);
  const [lastMonthReading, setLastMonthReading] = useState(previousReading);
  const [currentReading, setCurrentReading] = useState('');
  const [includeAirconCleaning, setIncludeAirconCleaning] = useState(false);
  const [includeWifi, setIncludeWifi] = useState(true);
  const [mineralWaterCount, setMineralWaterCount] = useState(0);

  // Rate resolution — same as useBills to keep parity
  const effectiveRates = useMemo(
    () => (tenant?.roomId ? getEffectiveRates(tenant.roomId, tenants, settings) : { electricityRate: 0, waterRate: 0, wifiRate: 0 }),
    [tenant, tenants, settings]
  );

  // Final bill line items (rent excluded — advance covers last month)
  const finalBill = useMemo(() => {
    const readingCurrent = parseFloat(currentReading) || 0;
    const readingLast = parseFloat(lastMonthReading) || 0;
    const kwh = Math.max(0, readingCurrent - readingLast);
    const persons = room?.persons || 0;
    const electricityBill = kwh * (effectiveRates.electricityRate || 0);
    const waterBill = persons * (effectiveRates.waterRate || 0);
    const wifiBill = includeWifi ? (effectiveRates.wifiRate || 0) : 0;
    const airconCleaningBill = includeAirconCleaning ? (settings.airconCleaningRate || 0) : 0;
    const mineralUnits = parseInt(mineralWaterCount, 10) || 0;
    const mineralWaterBill = mineralUnits * (settings.mineralWaterRate || 0);
    const totalExclRent = electricityBill + waterBill + wifiBill + airconCleaningBill + mineralWaterBill;
    return {
      electricityBill,
      waterBill,
      wifiBill,
      airconCleaningBill,
      mineralWaterBill,
      mineralWaterCount: mineralUnits,
      totalExclRent,
      kwh,
    };
  }, [currentReading, lastMonthReading, includeWifi, includeAirconCleaning, mineralWaterCount, effectiveRates, room, settings]);

  const securityDeposit = tenant?.securityDeposit || 0;
  const earlyTerminationPenalty = tenant?.earlyTerminationPenalty || 0;

  // The penalty is a bill line item, not a deposit deduction — that way a penalty
  // exceeding the remaining deposit is tracked as a balance the tenant still owes,
  // rather than silently flooring the refund at zero.
  const penaltyOnBill = applyPenalty ? earlyTerminationPenalty : 0;
  const finalBillTotal = finalBill.totalExclRent + penaltyOnBill;

  // Refund = deposit - (bill covered by deposit) - manual deductions
  const billCoveredByDeposit = issueFinalBill
    ? Math.min(securityDeposit, finalBillTotal)
    : 0;
  const remainingDepositAfterBill = securityDeposit - billCoveredByDeposit;
  const manualDeductions = parseFloat(deductions) || 0;
  const refundAmount = Math.max(0, remainingDepositAfterBill - manualDeductions);
  const billShortfall = issueFinalBill && finalBillTotal > securityDeposit
    ? finalBillTotal - securityDeposit
    : 0;

  if (!isOpen || !tenant) return null;

  // Early termination calc
  const moveInDate = tenant.moveInDate ? new Date(tenant.moveInDate) : null;
  const selectedMoveOutDate = moveOutDate ? new Date(moveOutDate) : new Date();
  const monthsStayed = moveInDate
    ? Math.floor((selectedMoveOutDate - moveInDate) / (1000 * 60 * 60 * 24 * 30))
    : 0;
  const isEarlyTermination = monthsStayed < 6;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(amount);

  const penaltyNote = `Early termination penalty of ${formatCurrency(earlyTerminationPenalty)} charged on the final bill.`;

  /**
   * Selecting "Early Termination" adds the tenant's contracted penalty as a line item
   * on the final bill and stamps an explanatory note. Switching away undoes both — the
   * note only when it's still the one we wrote, so manual edits are never clobbered.
   */
  const handleReasonChange = (value) => {
    const previousReason = moveOutReason;
    setMoveOutReason(value);

    if (earlyTerminationPenalty <= 0) return;

    if (value === 'early_termination') {
      setApplyPenalty(true);
      setNotes((prev) => (prev.includes(penaltyNote) ? prev : prev ? `${prev}\n${penaltyNote}` : penaltyNote));
    } else if (previousReason === 'early_termination') {
      setApplyPenalty(false);
      setNotes((prev) =>
        prev
          .split('\n')
          .filter((line) => line.trim() !== penaltyNote)
          .join('\n')
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const reasonInfo = MOVE_OUT_REASONS.find((r) => r.value === moveOutReason);

    // Compose the final-bill payload to hand to moveOutTenant.
    // Matches the schema in useBills.saveBill so bill list / totals / receipts work uniformly.
    let finalBillPayload = null;
    if (issueFinalBill) {
      const depositAmount = Math.min(securityDeposit, finalBillTotal);
      const paid = depositAmount >= finalBillTotal;
      finalBillPayload = {
        roomId: tenant.roomId,
        dueDate: moveOutDate,
        lastMonthReading: parseFloat(lastMonthReading) || 0,
        currentReading: parseFloat(currentReading) || 0,
        includeAirconCleaning,
        includeWifi,
        electricityBill: finalBill.electricityBill,
        waterBill: finalBill.waterBill,
        wifiBill: finalBill.wifiBill,
        rentBill: 0,
        airconCleaningBill: finalBill.airconCleaningBill,
        mineralWaterBill: finalBill.mineralWaterBill,
        mineralWaterCount: finalBill.mineralWaterCount,
        ratesUsed: {
          electricityRate: effectiveRates.electricityRate,
          waterRate: effectiveRates.waterRate,
          wifiRate: effectiveRates.wifiRate,
          mineralWaterRate: settings.mineralWaterRate || 0,
        },
        totalAmount: finalBillTotal,
        rentExcluded: true,
        penaltyApplied: penaltyOnBill > 0,
        penaltyAmount: penaltyOnBill,
        depositApplied: depositAmount > 0,
        depositAmount,
        amountPaid: depositAmount,
        paid,
        paidDate: paid ? moveOutDate : null,
        type: 'finalMoveOut',
        // Move-out context for the printed bill / audit
        securityDepositAtMoveOut: securityDeposit,
        additionalDeductions: manualDeductions,
        deductionsNotes: notes,
        refundAmount,
      };
    }

    onConfirmMoveOut(tenant, {
      moveOutDate,
      moveOutReason,
      moveOutReasonLabel: reasonInfo?.label || 'Normal Move-Out',
      refundAmount,
      deductions: manualDeductions,
      notes,
      isEarlyTermination,
      monthsStayed,
      finalBill: finalBillPayload,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 bg-red-50 dark:bg-red-900/20">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 flex items-center gap-2">
            <LogOut className="w-5 h-5" />
            Move Out Tenant
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Tenant Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Tenant:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{tenant.fullName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Room:</span>
                <span className="font-medium text-gray-900 dark:text-white">{room?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Move-in Date:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {tenant.moveInDate ? new Date(tenant.moveInDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Months Stayed:</span>
                <span className={`font-medium ${isEarlyTermination ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {monthsStayed} months {isEarlyTermination && '(Early Termination)'}
                </span>
              </div>
            </div>

            {isEarlyTermination && earlyTerminationPenalty > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Early Termination Penalty Applies</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Tenant is leaving before 6 months, and their contract carries a {formatCurrency(earlyTerminationPenalty)} penalty.
                      {applyPenalty
                        ? ' It is charged as a line item on the final bill below.'
                        : ' Select "Early Termination" as the reason to charge it on the final bill.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Move Out Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Move-Out Date
              </label>
              <input
                type="date"
                value={moveOutDate}
                onChange={(e) => setMoveOutDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Move Out Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Reason for Move-Out
              </label>
              <select
                value={moveOutReason}
                onChange={(e) => handleReasonChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {MOVE_OUT_REASONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {MOVE_OUT_REASONS.find((r) => r.value === moveOutReason)?.description}
              </p>
            </div>

            {/* Final Bill Section */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={issueFinalBill}
                  onChange={(e) => setIssueFinalBill(e.target.checked)}
                />
                <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                  <Zap className="w-4 h-4" /> Issue Final Bill
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                Rent is excluded automatically — advance rent covers the last month. Deposit is applied against the bill; anything left becomes the refund.
              </p>

              {issueFinalBill && (
                <div className="ml-6 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Previous reading</label>
                      <input
                        type="number"
                        step="0.01"
                        value={lastMonthReading}
                        onChange={(e) => setLastMonthReading(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Current reading</label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentReading}
                        onChange={(e) => setCurrentReading(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Meter reading on move-out day"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 cursor-pointer">
                      <input type="checkbox" checked={includeWifi} onChange={(e) => setIncludeWifi(e.target.checked)} />
                      Include WiFi
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeAirconCleaning}
                        onChange={(e) => setIncludeAirconCleaning(e.target.checked)}
                      />
                      Include Aircon Cleaning
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Mineral water units</label>
                    <input
                      type="number"
                      min="0"
                      value={mineralWaterCount}
                      onChange={(e) => setMineralWaterCount(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  {earlyTerminationPenalty > 0 && (
                    <label className="flex items-start gap-2 text-sm text-gray-800 dark:text-gray-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applyPenalty}
                        onChange={(e) => setApplyPenalty(e.target.checked)}
                        className="mt-1"
                      />
                      <span>
                        Charge early termination penalty — {formatCurrency(earlyTerminationPenalty)}
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          Auto-checked when the move-out reason is Early Termination.
                        </span>
                      </span>
                    </label>
                  )}

                  {/* Breakdown */}
                  <div className="text-xs bg-white dark:bg-gray-900/40 rounded p-3 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Electricity ({finalBill.kwh.toFixed(2)} kWh × {formatCurrency(effectiveRates.electricityRate || 0)})</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(finalBill.electricityBill)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Water ({room?.persons || 0} pax × {formatCurrency(effectiveRates.waterRate || 0)})</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(finalBill.waterBill)}</span>
                    </div>
                    {includeWifi && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">WiFi</span>
                        <span className="text-gray-900 dark:text-white">{formatCurrency(finalBill.wifiBill)}</span>
                      </div>
                    )}
                    {includeAirconCleaning && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Aircon Cleaning</span>
                        <span className="text-gray-900 dark:text-white">{formatCurrency(finalBill.airconCleaningBill)}</span>
                      </div>
                    )}
                    {finalBill.mineralWaterBill > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Mineral water ({finalBill.mineralWaterCount})</span>
                        <span className="text-gray-900 dark:text-white">{formatCurrency(finalBill.mineralWaterBill)}</span>
                      </div>
                    )}
                    {penaltyOnBill > 0 && (
                      <div className="flex justify-between text-red-700 dark:text-red-400 font-semibold">
                        <span>Early Termination Penalty</span>
                        <span>{formatCurrency(penaltyOnBill)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700 font-semibold">
                      <span className="text-gray-800 dark:text-gray-200">Total (rent excluded)</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(finalBillTotal)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Deposit / Refund */}
            <div className="rounded-lg p-4 space-y-3 bg-blue-50 dark:bg-blue-900/20">
              <h4 className="font-semibold flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <DollarSign className="w-4 h-4" /> Deposit &amp; Refund
              </h4>

              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Security deposit:</span>
                  <span className="font-medium text-blue-700 dark:text-blue-300">{formatCurrency(securityDeposit)}</span>
                </div>
                {issueFinalBill && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Applied to final bill:</span>
                    <span className="font-medium text-gray-900 dark:text-white">−{formatCurrency(billCoveredByDeposit)}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Additional deductions (damages, etc.)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={deductions}
                    onChange={(e) => setDeductions(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-blue-200 dark:border-blue-800 flex justify-between items-center">
                <span className="font-semibold text-gray-800 dark:text-white">Refund to tenant:</span>
                <span className={`text-lg font-bold ${refundAmount > 0 ? 'text-green-600 dark:text-green-300' : 'text-gray-500'}`}>
                  {formatCurrency(refundAmount)}
                </span>
              </div>

              {billShortfall > 0 && (
                <div className="text-xs bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-2 text-amber-800 dark:text-amber-200">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  Final bill exceeds deposit by {formatCurrency(billShortfall)}. Tenant still owes this amount — the bill will be created as partially paid.
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                rows="2"
                placeholder="Any notes about this move-out..."
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" /> Move-Out Summary
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Date:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {moveOutDate ? new Date(moveOutDate).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Reason:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {MOVE_OUT_REASONS.find((r) => r.value === moveOutReason)?.label}
                  </span>
                </div>
                {issueFinalBill && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Final bill:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(finalBillTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="font-semibold text-gray-900 dark:text-white">Refund:</span>
                  <span className="font-bold text-green-600 dark:text-green-400 text-lg">{formatCurrency(refundAmount)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Confirm Move Out
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MoveOutModal;

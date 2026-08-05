import { useState, useMemo } from 'react';
import { X, ArrowRightLeft, Calendar, DollarSign, AlertCircle, Zap, Home, FileText } from 'lucide-react';

/**
 * Transfer Room Modal
 * Guided flow for changing a tenant's room without moving them out.
 *
 * On submit, calls onConfirmTransfer(tenant, details).
 */
function TransferRoomModal({ isOpen, onClose, tenant, rooms, tenants, settings, onConfirmTransfer }) {
  const currentRoom = useMemo(
    () => rooms.find((r) => r.id === tenant?.roomId) || null,
    [rooms, tenant]
  );

  const vacantRooms = useMemo(() => {
    if (!tenant) return [];
    const occupiedRoomIds = new Set(
      tenants
        .filter((t) => t.isActive && t.id !== tenant.id && t.roomId)
        .map((t) => t.roomId)
    );
    return rooms.filter(
      (r) => r.isActive !== false && r.id !== tenant.roomId && !occupiedRoomIds.has(r.id)
    );
  }, [rooms, tenants, tenant]);

  const today = new Date().toISOString().split('T')[0];
  const [newRoomId, setNewRoomId] = useState('');
  const [transferDate, setTransferDate] = useState(today);
  const [finalReading, setFinalReading] = useState('');
  const [notes, setNotes] = useState('');
  const [customRatesChoice, setCustomRatesChoice] = useState('keep');
  const [editedRates, setEditedRates] = useState({
    electricityRate: tenant?.customRates?.electricityRate ?? '',
    waterRate: tenant?.customRates?.waterRate ?? '',
    wifiRate: tenant?.customRates?.wifiRate ?? '',
  });
  const [reconciledDeposit, setReconciledDeposit] = useState(0);
  const [reconciledAdvance, setReconciledAdvance] = useState(0);
  const [overrideReason, setOverrideReason] = useState('');
  const [refundStyle, setRefundStyle] = useState('cash');
  const [payNow, setPayNow] = useState(true);

  const newRoom = useMemo(
    () => rooms.find((r) => r.id === newRoomId) || null,
    [rooms, newRoomId]
  );

  const computedDeposit = newRoom?.rent || 0;
  const computedAdvance = newRoom?.rent || 0;
  const currentDeposit = tenant?.securityDeposit || 0;
  const currentAdvance = tenant?.advancePayment || 0;

  const depositTopUp = reconciledDeposit - currentDeposit;
  const advanceTopUp = reconciledAdvance - currentAdvance;
  const totalTopUp = depositTopUp + advanceTopUp;
  const isDownward = totalTopUp < 0;
  const isOverride =
    reconciledDeposit !== computedDeposit || reconciledAdvance !== computedAdvance;

  if (!isOpen || !tenant) return null;

  const handleRoomChange = (id) => {
    setNewRoomId(id);
    const room = rooms.find((r) => r.id === id);
    setReconciledDeposit(room?.rent || 0);
    setReconciledAdvance(room?.rent || 0);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);

  const resolveCustomRatesAtTransfer = () => {
    if (customRatesChoice === 'reset') return null;
    if (customRatesChoice === 'edit') {
      return {
        electricityRate: editedRates.electricityRate === '' ? null : parseFloat(editedRates.electricityRate),
        waterRate: editedRates.waterRate === '' ? null : parseFloat(editedRates.waterRate),
        wifiRate: editedRates.wifiRate === '' ? null : parseFloat(editedRates.wifiRate),
      };
    }
    return tenant.customRates || null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newRoomId) return;
    if (isOverride && !overrideReason.trim()) return;

    onConfirmTransfer(tenant, {
      newRoomId,
      newRoomRent: newRoom?.rent || 0,
      oldRoomId: tenant.roomId,
      oldRoomRent: currentRoom?.rent || 0,
      transferDate,
      notes: notes.trim(),
      finalElectricityReading: finalReading === '' ? null : parseFloat(finalReading),
      customRatesChoice,
      customRatesAtTransfer: resolveCustomRatesAtTransfer(),
      reconciledDeposit,
      reconciledAdvance,
      depositTopUp,
      advanceTopUp,
      overrideReason: isOverride ? overrideReason.trim() : '',
      refundStyle: isDownward ? refundStyle : null,
      payNow,
    });
    onClose();
  };

  const submitDisabled = !newRoomId || (isOverride && !overrideReason.trim());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/20">
          <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Transfer Room
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Tenant:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{tenant.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Current room:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {currentRoom?.name || '—'} ({formatCurrency(currentRoom?.rent || 0)} / mo)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Held deposit / advance:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(currentDeposit)} / {formatCurrency(currentAdvance)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Home className="w-4 h-4 inline mr-1" /> Destination Room
              </label>
              <select
                value={newRoomId}
                onChange={(e) => handleRoomChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select a vacant room…</option>
                {vacantRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {formatCurrency(r.rent || 0)} / mo
                  </option>
                ))}
              </select>
              {vacantRooms.length === 0 && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  No vacant rooms available for transfer.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" /> Transfer Date
              </label>
              <input
                type="date"
                value={transferDate}
                max={today}
                onChange={(e) => setTransferDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Zap className="w-4 h-4 inline mr-1" /> Final Electricity Reading — {currentRoom?.name || 'old room'}
              </label>
              <input
                type="number"
                step="0.01"
                value={finalReading}
                onChange={(e) => setFinalReading(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                placeholder="Meter reading on transfer day"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Used as <code>lastMonthReading</code> on the next monthly bill for {currentRoom?.name || 'this room'}.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Custom Utility Rates
              </label>
              <div className="space-y-1 text-sm">
                {['keep', 'reset', 'edit'].map((choice) => (
                  <label key={choice} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="customRatesChoice"
                      value={choice}
                      checked={customRatesChoice === choice}
                      onChange={() => setCustomRatesChoice(choice)}
                    />
                    <span className="capitalize text-gray-800 dark:text-gray-200">{choice}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {choice === 'keep' && '— tenant keeps existing rate overrides at new room'}
                      {choice === 'reset' && '— clear overrides, fall back to global settings'}
                      {choice === 'edit' && '— set new values below'}
                    </span>
                  </label>
                ))}
              </div>
              {customRatesChoice === 'edit' && (
                <div className="grid grid-cols-3 gap-2">
                  {['electricityRate', 'waterRate', 'wifiRate'].map((field) => (
                    <div key={field}>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 capitalize">
                        {field.replace('Rate', '')}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editedRates[field]}
                        onChange={(e) => setEditedRates({ ...editedRates, [field]: e.target.value })}
                        placeholder={`global: ${settings?.[field] ?? '—'}`}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {newRoom && (
              <div className={`rounded-lg p-4 space-y-3 ${
                isDownward ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-blue-50 dark:bg-blue-900/20'
              }`}>
                <h4 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                  <DollarSign className="w-4 h-4" />
                  Deposit &amp; Advance Reconciliation
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      New security deposit (computed: {formatCurrency(computedDeposit)})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={reconciledDeposit}
                      onChange={(e) => setReconciledDeposit(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className={`mt-1 text-xs ${depositTopUp < 0 ? 'text-emerald-700 dark:text-emerald-300' : depositTopUp > 0 ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500'}`}>
                      Δ {formatCurrency(depositTopUp)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      New advance payment (computed: {formatCurrency(computedAdvance)})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={reconciledAdvance}
                      onChange={(e) => setReconciledAdvance(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className={`mt-1 text-xs ${advanceTopUp < 0 ? 'text-emerald-700 dark:text-emerald-300' : advanceTopUp > 0 ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500'}`}>
                      Δ {formatCurrency(advanceTopUp)}
                    </p>
                  </div>
                </div>

                {isOverride && (
                  <div>
                    <label className="block text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">
                      <AlertCircle className="w-3 h-3 inline mr-1" /> Reason for override (required)
                    </label>
                    <input
                      type="text"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-amber-300 dark:border-amber-700 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g. negotiated discount, verbal partial payment"
                      required
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Transfer top-up total:
                  </span>
                  <span className={`text-lg font-bold ${isDownward ? 'text-emerald-700 dark:text-emerald-300' : 'text-blue-700 dark:text-blue-300'}`}>
                    {formatCurrency(totalTopUp)}
                  </span>
                </div>

                {isDownward && (
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Refund style</label>
                    <select
                      value={refundStyle}
                      onChange={(e) => setRefundStyle(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="cash">Cash refund at transfer</option>
                      <option value="credit">Credit toward next rent</option>
                      <option value="keep-surplus">Leave surplus in place</option>
                    </select>
                  </div>
                )}

                {!isDownward && totalTopUp > 0 && (
                  <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 cursor-pointer">
                    <input type="checkbox" checked={payNow} onChange={(e) => setPayNow(e.target.checked)} />
                    <span>Mark top-up paid now (uncheck to leave it as an outstanding bill)</span>
                  </label>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-1" /> Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Why the transfer? Any special arrangements?"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitDisabled}
                className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                <ArrowRightLeft className="w-4 h-4" />
                Confirm Transfer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TransferRoomModal;

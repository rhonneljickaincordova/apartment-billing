import { useState, useMemo } from 'react';
import { X, ArrowRightLeft, Calendar, DollarSign, AlertCircle, Zap, Home, FileText } from 'lucide-react';
import { getEffectiveRates } from '../../utils/rateHelpers';

/**
 * Transfer Room Modal
 *
 * Guided flow for moving an active tenant to a new room. Produces one combined
 * final bill on the OLD room containing:
 *   - Utility charges for the tenant's final stay in the old room (rent excluded)
 *   - Security Deposit Top-up / Refund
 *   - Advance Payment Top-up / Refund
 *
 * The bill's total is the netto (utilities + top-up). Positive net = tenant owes;
 * negative net = landlord owes tenant (refund). Bill defaults to unpaid — landlord
 * checks "Mark Paid Now" to auto-record payment (or refund) at creation.
 */
function TransferRoomModal({ isOpen, onClose, tenant, rooms, tenants, settings, bills = [], onConfirmTransfer }) {
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

  // Effective rates for the OLD room (this is the room being billed for utilities)
  const oldRoomRates = useMemo(
    () => (tenant?.roomId
      ? getEffectiveRates(tenant.roomId, tenants, settings)
      : { electricityRate: 0, waterRate: 0, wifiRate: 0 }),
    [tenant, tenants, settings]
  );

  // Auto-fill previous reading from the most recent bill for the old room
  const previousReading = useMemo(() => {
    if (!tenant?.roomId) return 0;
    const roomBills = bills
      .filter((b) => b.roomId === tenant.roomId && b.currentReading != null)
      .sort((a, b) => new Date(b.dueDate || 0) - new Date(a.dueDate || 0));
    return roomBills[0]?.currentReading || 0;
  }, [bills, tenant]);

  const today = new Date().toISOString().split('T')[0];
  const [newRoomId, setNewRoomId] = useState('');
  const [transferDate, setTransferDate] = useState(today);
  const [notes, setNotes] = useState('');

  // Final bill fields (old room's rent + utilities)
  const [includeRent, setIncludeRent] = useState(true);
  const [lastMonthReading, setLastMonthReading] = useState(previousReading);
  const [currentReading, setCurrentReading] = useState('');
  const [includeAirconCleaning, setIncludeAirconCleaning] = useState(false);
  const [includeWifi, setIncludeWifi] = useState(true);
  const [mineralWaterCount, setMineralWaterCount] = useState(0);

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
  const [payNow, setPayNow] = useState(false);

  const newRoom = useMemo(
    () => rooms.find((r) => r.id === newRoomId) || null,
    [rooms, newRoomId]
  );

  const computedDeposit = newRoom?.rent || 0;
  const computedAdvance = newRoom?.rent || 0;
  const currentDeposit = tenant?.securityDeposit || 0;
  const currentAdvance = tenant?.advancePayment || 0;

  // Utility line items on the old room
  const utilityBill = useMemo(() => {
    const readCur = parseFloat(currentReading) || 0;
    const readLast = parseFloat(lastMonthReading) || 0;
    const kwh = Math.max(0, readCur - readLast);
    const persons = currentRoom?.persons || 0;
    const electricityBill = kwh * (oldRoomRates.electricityRate || 0);
    const waterBill = persons * (oldRoomRates.waterRate || 0);
    const wifiBill = includeWifi ? (oldRoomRates.wifiRate || 0) : 0;
    const airconCleaningBill = includeAirconCleaning ? (settings.airconCleaningRate || 0) : 0;
    const mineralUnits = parseInt(mineralWaterCount, 10) || 0;
    const mineralWaterBill = mineralUnits * (settings.mineralWaterRate || 0);
    const total = electricityBill + waterBill + wifiBill + airconCleaningBill + mineralWaterBill;
    return { kwh, electricityBill, waterBill, wifiBill, airconCleaningBill, mineralWaterBill, mineralWaterCount: mineralUnits, total };
  }, [currentReading, lastMonthReading, includeWifi, includeAirconCleaning, mineralWaterCount, oldRoomRates, currentRoom, settings]);

  // Rent for the transfer month is charged at the OLD room's rate — the tenant
  // started the month there. The new room begins billing on the next cycle.
  const rentAmount = includeRent ? (currentRoom?.rent || 0) : 0;

  const depositTopUp = reconciledDeposit - currentDeposit;
  const advanceTopUp = reconciledAdvance - currentAdvance;
  const totalTopUp = depositTopUp + advanceTopUp;
  const grandTotal = rentAmount + utilityBill.total + totalTopUp;
  const isRefund = grandTotal < 0;
  const hasNegativeTopUp = totalTopUp < 0;
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
      // Final bill lines for the old room (rent + utilities)
      utilityBill: {
        includeRent,
        rentBill: rentAmount,
        lastMonthReading: parseFloat(lastMonthReading) || 0,
        currentReading: parseFloat(currentReading) || 0,
        includeAirconCleaning,
        includeWifi,
        mineralWaterCount: utilityBill.mineralWaterCount,
        electricityBill: utilityBill.electricityBill,
        waterBill: utilityBill.waterBill,
        wifiBill: utilityBill.wifiBill,
        airconCleaningBill: utilityBill.airconCleaningBill,
        mineralWaterBill: utilityBill.mineralWaterBill,
        totalUtilities: utilityBill.total,
        ratesUsed: {
          electricityRate: oldRoomRates.electricityRate,
          waterRate: oldRoomRates.waterRate,
          wifiRate: oldRoomRates.wifiRate,
          mineralWaterRate: settings.mineralWaterRate || 0,
        },
      },
      customRatesChoice,
      customRatesAtTransfer: resolveCustomRatesAtTransfer(),
      reconciledDeposit,
      reconciledAdvance,
      depositTopUp,
      advanceTopUp,
      grandTotal,
      overrideReason: isOverride ? overrideReason.trim() : '',
      refundStyle: hasNegativeTopUp ? refundStyle : null,
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

            {/* Final Utility Bill for the OLD room */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Final Bill — {currentRoom?.name || 'old room'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Rent for the transfer month is charged at the old room's rate. {newRoom?.name || 'The new room'} starts billing on the next cycle.
              </p>

              <label className="flex items-start gap-2 text-sm text-gray-800 dark:text-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeRent}
                  onChange={(e) => setIncludeRent(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  Include rent — {formatCurrency(currentRoom?.rent || 0)}
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    Uncheck if this month's rent was already billed before the transfer.
                  </span>
                </span>
              </label>

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
                    placeholder="Meter reading on transfer day"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 cursor-pointer">
                  <input type="checkbox" checked={includeWifi} onChange={(e) => setIncludeWifi(e.target.checked)} />
                  Include WiFi
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 cursor-pointer">
                  <input type="checkbox" checked={includeAirconCleaning} onChange={(e) => setIncludeAirconCleaning(e.target.checked)} />
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

              <div className="text-xs bg-white dark:bg-gray-900/40 rounded p-3 space-y-1">
                {includeRent && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Rent — {currentRoom?.name || 'old room'}</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(rentAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Electricity ({utilityBill.kwh.toFixed(2)} kWh × {formatCurrency(oldRoomRates.electricityRate || 0)})</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(utilityBill.electricityBill)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Water ({currentRoom?.persons || 0} pax × {formatCurrency(oldRoomRates.waterRate || 0)})</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(utilityBill.waterBill)}</span>
                </div>
                {includeWifi && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">WiFi</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(utilityBill.wifiBill)}</span>
                  </div>
                )}
                {includeAirconCleaning && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Aircon Cleaning</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(utilityBill.airconCleaningBill)}</span>
                  </div>
                )}
                {utilityBill.mineralWaterBill > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Mineral water ({utilityBill.mineralWaterCount})</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(utilityBill.mineralWaterBill)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700 font-semibold">
                  <span className="text-gray-800 dark:text-gray-200">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(rentAmount + utilityBill.total)}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Custom Utility Rates (going forward)
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
                hasNegativeTopUp ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-blue-50 dark:bg-blue-900/20'
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

                {hasNegativeTopUp && (
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
              </div>
            )}

            {/* Grand total preview */}
            {newRoom && (
              <div className={`rounded-lg p-4 space-y-1 text-sm ${isRefund ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                {includeRent && (
                  <div className="flex justify-between text-gray-700 dark:text-gray-200">
                    <span>Rent ({currentRoom?.name || 'old room'})</span>
                    <span>{formatCurrency(rentAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700 dark:text-gray-200">
                  <span>Utilities (old room)</span>
                  <span>{formatCurrency(utilityBill.total)}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-200">
                  <span>Security Deposit Top-up</span>
                  <span>{formatCurrency(depositTopUp)}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-200">
                  <span>Advance Payment Top-up</span>
                  <span>{formatCurrency(advanceTopUp)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-700 font-bold text-base">
                  <span className="text-gray-900 dark:text-white">
                    {isRefund ? 'Refund to tenant' : 'Amount owed by tenant'}
                  </span>
                  <span className={isRefund ? 'text-emerald-700 dark:text-emerald-300' : 'text-blue-700 dark:text-blue-300'}>
                    {formatCurrency(Math.abs(grandTotal))}
                  </span>
                </div>
              </div>
            )}

            {newRoom && grandTotal !== 0 && (
              <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 cursor-pointer">
                <input type="checkbox" checked={payNow} onChange={(e) => setPayNow(e.target.checked)} />
                <span>
                  {isRefund
                    ? 'Refund tendered now (mark bill paid)'
                    : 'Tenant paying now (mark bill paid)'}
                </span>
              </label>
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

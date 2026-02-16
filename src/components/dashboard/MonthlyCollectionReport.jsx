import { useState, useMemo, useRef } from 'react';
import { Download, FileText, ChevronLeft, ChevronRight, TrendingUp, Calendar, Home, DollarSign } from 'lucide-react';

/**
 * Format currency in PHP
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

/**
 * Short currency format for table cells
 */
const formatShortCurrency = (amount) => {
  if (amount === 0 || amount === undefined || amount === null) return '-';
  return `₱${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const FULL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Monthly Collection Report Component
 * Shows cash collected per room per month in a table format
 */
function MonthlyCollectionReport({ rooms, bills, tenants = [], getBillTotal, onBack }) {
  const reportRef = useRef(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);

  // Get available years from bills
  const availableYears = useMemo(() => {
    const years = new Set();
    bills.forEach(bill => {
      if (bill.dueDate) {
        const year = new Date(bill.dueDate).getFullYear();
        years.add(year);
      }
    });
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [bills]);

  // Calculate monthly collections per room (including refunds and advance payments)
  const monthlyData = useMemo(() => {
    const data = {};

    rooms.forEach(room => {
      data[room.id] = {
        roomName: room.name,
        months: Array(12).fill(null).map(() => ({ collected: 0, collectedFromFinalBill: 0, refund: 0, advance: 0 })),
        total: 0,
        totalRefund: 0,
        totalAdvance: 0,
      };
    });

    // Process bills for collected amounts and refunds
    bills.forEach(bill => {
      if (!bill.dueDate) return;

      const billDate = new Date(bill.dueDate);
      const billYear = billDate.getFullYear();
      const billMonth = billDate.getMonth();

      if (billYear !== selectedYear) return;
      if (!data[bill.roomId]) return;

      let collected = 0;
      let refund = 0;
      let isFinalBill = false;

      if (bill.amountPaid) {
        collected = bill.amountPaid;
        // If deposit was applied, subtract it to get only the actual cash payment
        // (deposit was already counted when tenant moved in, not on this bill)
        if (bill.depositApplied && bill.depositAmount > 0) {
          collected = Math.max(0, collected - bill.depositAmount);
          isFinalBill = true; // This is an outgoing tenant's final bill
        }
      } else if (bill.paid) {
        collected = getBillTotal(bill, bill.rentExcluded || false);
        // Same adjustment for deposit
        if (bill.depositApplied && bill.depositAmount > 0) {
          collected = Math.max(0, collected - bill.depositAmount);
          isFinalBill = true; // This is an outgoing tenant's final bill
        }
      }

      // Check for refunds (when deposit exceeds bill total)
      if (bill.depositApplied && bill.depositAmount > 0) {
        const billTotal = getBillTotal(bill, bill.rentExcluded || false);
        if (bill.depositAmount > billTotal) {
          refund = bill.depositAmount - billTotal;
        }
      }

      data[bill.roomId].months[billMonth].collected += collected;
      // Track if this collected amount is from the outgoing tenant's final bill
      if (isFinalBill && collected > 0) {
        data[bill.roomId].months[billMonth].collectedFromFinalBill += collected;
      }
      data[bill.roomId].months[billMonth].refund += refund;
      data[bill.roomId].total += collected;
      data[bill.roomId].totalRefund += refund;
    });

    // Process tenant move-in payments (advance + deposit)
    tenants.forEach(tenant => {
      if (!tenant.roomId || !data[tenant.roomId]) return;

      // Calculate total move-in payment (advance + deposit)
      const advanceAmount = tenant.advancePayment || 0;
      const depositAmount = tenant.securityDeposit || 0;
      const totalMoveInPayment = advanceAmount + depositAmount;

      if (totalMoveInPayment <= 0) return;

      // Use advancePaymentDate if available, otherwise use moveInDate
      const advanceDate = tenant.advancePaymentDate || tenant.moveInDate;
      if (!advanceDate) return;

      const paymentDate = new Date(advanceDate);
      const paymentYear = paymentDate.getFullYear();
      const paymentMonth = paymentDate.getMonth();

      if (paymentYear !== selectedYear) return;

      data[tenant.roomId].months[paymentMonth].advance += totalMoveInPayment;
      data[tenant.roomId].totalAdvance += totalMoveInPayment;
    });

    return data;
  }, [rooms, bills, tenants, selectedYear, getBillTotal]);

  // Calculate monthly totals (collected, refunds, and advance payments separately)
  const monthlyTotals = useMemo(() => {
    const totals = Array(12).fill(null).map(() => ({ collected: 0, refund: 0, advance: 0 }));
    let grandTotalCollected = 0;
    let grandTotalRefund = 0;
    let grandTotalAdvance = 0;

    Object.values(monthlyData).forEach(roomData => {
      roomData.months.forEach((monthData, index) => {
        totals[index].collected += monthData.collected;
        totals[index].refund += monthData.refund;
        totals[index].advance += monthData.advance;
      });
      grandTotalCollected += roomData.total;
      grandTotalRefund += roomData.totalRefund;
      grandTotalAdvance += roomData.totalAdvance;
    });

    return { totals, grandTotalCollected, grandTotalRefund, grandTotalAdvance };
  }, [monthlyData]);

  // Sort rooms by name
  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => {
      const aNum = parseInt(a.name.replace(/\D/g, '')) || 0;
      const bNum = parseInt(b.name.replace(/\D/g, '')) || 0;
      if (aNum !== bNum) return aNum - bNum;
      return a.name.localeCompare(b.name);
    });
  }, [rooms]);

  // Find best performing month (based on actual cash inflow)
  const bestMonth = useMemo(() => {
    // Calculate per-room contributions for each month
    const inflowValues = Array(12).fill(0);
    Object.values(monthlyData).forEach(roomData => {
      roomData.months.forEach((m, index) => {
        if (m.refund > 0) {
          // This room has a move-out this month
          inflowValues[index] += m.advance - m.refund;
        } else {
          // Normal month for this room
          inflowValues[index] += m.collected + m.advance;
        }
      });
    });
    const maxValue = Math.max(...inflowValues);
    const index = inflowValues.indexOf(maxValue);
    return { index, value: maxValue, name: FULL_MONTHS[index] };
  }, [monthlyData]);

  // Current month index
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const handlePrevYear = () => {
    if (availableYears.includes(selectedYear - 1) || selectedYear - 1 >= Math.min(...availableYears) - 1) {
      setSelectedYear(selectedYear - 1);
    }
  };

  const handleNextYear = () => {
    if (selectedYear < new Date().getFullYear()) {
      setSelectedYear(selectedYear + 1);
    }
  };

  const handleDownloadImage = async () => {
    setIsGenerating(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = reportRef.current;

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `Monthly-Collection-Report-${selectedYear}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Room', ...MONTHS.map(m => `${m} Collected`), ...MONTHS.map(m => `${m} Advance`), ...MONTHS.map(m => `${m} Refund`), 'Total Collected', 'Total Advance', 'Total Refund', 'Net'];
    const rows = sortedRooms.map(room => {
      const roomData = monthlyData[room.id];
      const netTotal = roomData.total + roomData.totalAdvance - roomData.totalRefund;
      return [
        room.name,
        ...roomData.months.map(m => m.collected || ''),
        ...roomData.months.map(m => m.advance || ''),
        ...roomData.months.map(m => m.refund || ''),
        roomData.total,
        roomData.totalAdvance,
        roomData.totalRefund,
        netTotal,
      ];
    });

    // Calculate net grand total using per-room logic for CSV export
    let netGrandTotal = 0;
    Object.values(monthlyData).forEach(roomData => {
      roomData.months.forEach(m => {
        if (m.refund > 0) {
          netGrandTotal += m.advance - m.refund;
        } else {
          netGrandTotal += m.collected + m.advance;
        }
      });
    });
    rows.push([
      'Total per Month',
      ...monthlyTotals.totals.map(t => t.collected || ''),
      ...monthlyTotals.totals.map(t => t.advance || ''),
      ...monthlyTotals.totals.map(t => t.refund || ''),
      monthlyTotals.grandTotalCollected,
      monthlyTotals.grandTotalAdvance,
      monthlyTotals.grandTotalRefund,
      netGrandTotal,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.download = `Monthly-Collection-Report-${selectedYear}.csv`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Collection Report</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cash collected per room per month</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Year selector */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg">
              <button
                onClick={handlePrevYear}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              <span className="px-4 py-2 font-bold text-gray-900 dark:text-white min-w-[60px] text-center">
                {selectedYear}
              </span>
              <button
                onClick={handleNextYear}
                disabled={selectedYear >= currentYear}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={handleDownloadImage}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              {isGenerating ? '...' : 'Image'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      {(() => {
        // Calculate actual cash grand total using per-room logic
        let netGrandTotal = 0;
        Object.values(monthlyData).forEach(roomData => {
          roomData.months.forEach(m => {
            if (m.refund > 0) {
              netGrandTotal += m.advance - m.refund;
            } else {
              netGrandTotal += m.collected + m.advance;
            }
          });
        });
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Home className="w-4 h-4 opacity-80" />
                <span className="text-xs font-medium opacity-80">Total Rooms</span>
              </div>
              <p className="text-2xl font-bold">{rooms.length}</p>
            </div>
            <div className={`bg-gradient-to-br ${netGrandTotal >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'} rounded-xl p-4 text-white`}>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 opacity-80" />
                <span className="text-xs font-medium opacity-80">Net Cash Flow</span>
              </div>
              <p className="text-xl font-bold">{netGrandTotal < 0 ? '-' : ''}{formatCurrency(Math.abs(netGrandTotal))}</p>
              {(monthlyTotals.grandTotalRefund > 0 || monthlyTotals.grandTotalAdvance > 0) && (
                <div className="text-xs opacity-70 mt-1">
                  {monthlyTotals.grandTotalAdvance > 0 && <span className="mr-2">New: +{formatCurrency(monthlyTotals.grandTotalAdvance)}</span>}
                  {monthlyTotals.grandTotalRefund > 0 && <span>Out: -{formatCurrency(monthlyTotals.grandTotalRefund)}</span>}
                </div>
              )}
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 opacity-80" />
                <span className="text-xs font-medium opacity-80">Monthly Avg</span>
              </div>
              <p className="text-xl font-bold">{formatCurrency(netGrandTotal / 12)}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 opacity-80" />
                <span className="text-xs font-medium opacity-80">Best Month</span>
              </div>
              <p className="text-xl font-bold">{bestMonth.name?.slice(0, 3) || 'N/A'}</p>
            </div>
          </div>
        );
      })()}

      {/* Report Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden" ref={reportRef}>
        {/* Table Header Title */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900 px-4 py-3">
          <h3 className="text-lg font-bold text-white text-center">
            Monthly Collection Report - {selectedYear}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <th className="px-3 py-3 text-left font-bold text-white sticky left-0 z-10 bg-gradient-to-r from-blue-600 to-blue-600 min-w-[100px] border-r border-blue-500">
                  Room
                </th>
                {MONTHS.map((month, index) => (
                  <th
                    key={month}
                    className={`px-2 py-3 text-center font-semibold text-white min-w-[85px] ${
                      index === currentMonth && selectedYear === currentYear
                        ? 'bg-blue-400/30 ring-2 ring-inset ring-white/30'
                        : ''
                    }`}
                  >
                    {month}
                  </th>
                ))}
                <th className="px-3 py-3 text-center font-bold text-white min-w-[100px] bg-indigo-700 border-l border-indigo-500">
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {sortedRooms.map((room, index) => {
                const roomData = monthlyData[room.id];
                const hasData = roomData.total > 0 || roomData.totalRefund > 0;

                return (
                  <tr
                    key={room.id}
                    className={`transition-colors ${
                      index % 2 === 0
                        ? 'bg-gray-50/50 dark:bg-gray-800/50'
                        : 'bg-white dark:bg-gray-800'
                    } hover:bg-blue-50/50 dark:hover:bg-blue-900/20`}
                  >
                    <td className={`px-3 py-2.5 font-semibold text-gray-800 dark:text-gray-200 sticky left-0 z-10 border-r border-gray-100 dark:border-gray-700 ${
                      index % 2 === 0
                        ? 'bg-gray-50 dark:bg-gray-800'
                        : 'bg-white dark:bg-gray-800'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${hasData ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                        {room.name}
                      </div>
                    </td>
                    {roomData.months.map((monthData, monthIndex) => {
                      const hasAdvance = monthData.advance > 0;
                      const hasRefund = monthData.refund > 0;
                      const hasCollected = monthData.collected > 0;

                      // When there's a refund, the "collected" amount is from deposit settlement (not actual cash)
                      // So we don't count it as actual cash inflow when calculating display
                      // Net for move-out scenario = advance (from new tenant) - refund (to old tenant)
                      // Net for normal scenario = collected + advance - refund
                      const netAmount = hasRefund
                        ? monthData.advance - monthData.refund  // Move-out: only count advance and refund
                        : monthData.collected + monthData.advance;  // Normal: count collected + advance

                      // Check if we have both new tenant advance and old tenant refund
                      const hasMoveInAndMoveOut = hasAdvance && hasRefund;

                      return (
                        <td
                          key={monthIndex}
                          className={`px-2 py-2.5 text-right font-mono text-xs ${
                            monthIndex === currentMonth && selectedYear === currentYear
                              ? 'bg-blue-50/50 dark:bg-blue-900/10'
                              : ''
                          }`}
                        >
                          {hasMoveInAndMoveOut ? (
                            // Both new tenant (advance) and old tenant (refund) in same month
                            <div className="flex flex-col items-end gap-0.5">
                              <span className={`font-semibold ${netAmount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                {netAmount < 0 ? '-' : ''}{formatShortCurrency(Math.abs(netAmount))}
                              </span>
                              <div className="flex flex-col items-end text-[9px] leading-tight">
                                <span className="text-blue-500 dark:text-blue-400">
                                  {formatShortCurrency(monthData.advance)} <span className="text-[8px]">(new)</span>
                                </span>
                                <span className="text-red-500 dark:text-red-400">
                                  -{formatShortCurrency(monthData.refund)} <span className="text-[8px]">(out)</span>
                                </span>
                              </div>
                            </div>
                          ) : hasRefund ? (
                            // Only refund (tenant move-out) - don't show collected since it's from deposit
                            <div className="flex flex-col items-end">
                              <span className="text-red-600 dark:text-red-400">
                                -{formatShortCurrency(monthData.refund)}
                              </span>
                              <span className="text-[9px] text-red-400 dark:text-red-500">(out)</span>
                            </div>
                          ) : hasAdvance && hasCollected ? (
                            // Both collected (from outgoing tenant) and advance (new tenant) in same month
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {formatShortCurrency(netAmount)}
                              </span>
                              <div className="flex flex-col items-end text-[9px] leading-tight">
                                {monthData.collectedFromFinalBill > 0 ? (
                                  <span className="text-orange-500 dark:text-orange-400">
                                    {formatShortCurrency(monthData.collected)} <span className="text-[8px]">(out)</span>
                                  </span>
                                ) : (
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {formatShortCurrency(monthData.collected)}
                                  </span>
                                )}
                                <span className="text-blue-500 dark:text-blue-400">
                                  {formatShortCurrency(monthData.advance)} <span className="text-[8px]">(new)</span>
                                </span>
                              </div>
                            </div>
                          ) : hasAdvance ? (
                            // Only advance payment (new tenant move-in)
                            <div className="flex flex-col items-end">
                              <span className="text-blue-600 dark:text-blue-400">
                                {formatShortCurrency(monthData.advance)}
                              </span>
                              <span className="text-[9px] text-blue-400 dark:text-blue-500">(new)</span>
                            </div>
                          ) : hasCollected ? (
                            monthData.collectedFromFinalBill > 0 ? (
                              // Collected from outgoing tenant's final bill
                              <div className="flex flex-col items-end">
                                <span className="text-orange-600 dark:text-orange-400">
                                  {formatShortCurrency(monthData.collected)}
                                </span>
                                <span className="text-[9px] text-orange-400 dark:text-orange-500">(out)</span>
                              </div>
                            ) : (
                              // Normal collection
                              <span className="text-gray-800 dark:text-gray-200">
                                {formatShortCurrency(monthData.collected)}
                              </span>
                            )
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">-</span>
                          )}
                        </td>
                      );
                    })}
                    {(() => {
                      // Calculate actual cash flow per room
                      // When there's a refund month, don't count "collected" as it came from deposit
                      let actualCashTotal = 0;
                      roomData.months.forEach(m => {
                        if (m.refund > 0) {
                          // Move-out month: only count advance - refund
                          actualCashTotal += m.advance - m.refund;
                        } else {
                          // Normal month: count collected + advance
                          actualCashTotal += m.collected + m.advance;
                        }
                      });

                      return (
                        <td className={`px-3 py-2.5 text-right font-bold font-mono text-xs border-l border-gray-100 dark:border-gray-700 ${
                          actualCashTotal !== 0 ? 'bg-emerald-50/50 dark:bg-emerald-900/20' : ''
                        }`}>
                          {actualCashTotal > 0 && (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {formatShortCurrency(actualCashTotal)}
                            </span>
                          )}
                          {actualCashTotal < 0 && (
                            <span className="text-red-600 dark:text-red-400">
                              -{formatShortCurrency(Math.abs(actualCashTotal))}
                            </span>
                          )}
                          {actualCashTotal === 0 && (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                      );
                    })()}
                  </tr>
                );
              })}
            </tbody>
            {/* Totals Footer */}
            <tfoot>
              <tr className="bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900">
                <td className="px-3 py-3 font-bold text-white sticky left-0 z-10 bg-gradient-to-r from-slate-700 to-slate-700 dark:from-slate-800 dark:to-slate-800 border-r border-slate-600">
                  Total per Month
                </td>
                {monthlyTotals.totals.map((total, index) => {
                  // Calculate per-room contributions for this month
                  // We need to sum each room's cash flow based on whether THAT ROOM has a refund
                  let netMonthTotal = 0;
                  Object.values(monthlyData).forEach(roomData => {
                    const m = roomData.months[index];
                    if (m.refund > 0) {
                      // This room has a move-out this month
                      netMonthTotal += m.advance - m.refund;
                    } else {
                      // Normal month for this room
                      netMonthTotal += m.collected + m.advance;
                    }
                  });
                  const isBestMonth = netMonthTotal === bestMonth.value && netMonthTotal > 0;
                  return (
                    <td
                      key={index}
                      className={`px-2 py-3 text-right font-bold font-mono text-xs ${
                        index === currentMonth && selectedYear === currentYear
                          ? 'bg-white/10'
                          : ''
                      }`}
                    >
                      {netMonthTotal > 0 ? (
                        <span className={isBestMonth ? 'text-amber-300' : 'text-white'}>
                          {formatShortCurrency(netMonthTotal)}
                        </span>
                      ) : netMonthTotal < 0 ? (
                        <span className="text-red-400">
                          -{formatShortCurrency(Math.abs(netMonthTotal))}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  );
                })}
                {(() => {
                  // Calculate actual cash grand total - sum each room's contribution per month
                  let actualGrandTotal = 0;
                  Object.values(monthlyData).forEach(roomData => {
                    roomData.months.forEach(m => {
                      if (m.refund > 0) {
                        actualGrandTotal += m.advance - m.refund;
                      } else {
                        actualGrandTotal += m.collected + m.advance;
                      }
                    });
                  });
                  return (
                    <td className="px-3 py-3 text-right font-bold font-mono text-sm bg-slate-900/50 border-l border-slate-600">
                      {actualGrandTotal >= 0 ? (
                        <span className="text-amber-300">{formatShortCurrency(actualGrandTotal)}</span>
                      ) : (
                        <span className="text-red-400">-{formatShortCurrency(Math.abs(actualGrandTotal))}</span>
                      )}
                    </td>
                  );
                })()}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700 p-4">
          {(() => {
            // Calculate actual cash grand total using per-room logic
            let netGrandTotal = 0;
            Object.values(monthlyData).forEach(roomData => {
              roomData.months.forEach(m => {
                if (m.refund > 0) {
                  netGrandTotal += m.advance - m.refund;
                } else {
                  netGrandTotal += m.collected + m.advance;
                }
              });
            });
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Active Rooms</p>
                  <p className="text-lg font-bold">
                    <span className="text-emerald-600 dark:text-emerald-400">{rooms.filter(r => r.status === 'occupied').length}</span>
                    <span className="text-gray-400 dark:text-gray-500"> / </span>
                    <span className="text-gray-600 dark:text-gray-300">{rooms.length}</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Year Cash Flow</p>
                  <p className={`text-lg font-bold ${netGrandTotal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {netGrandTotal < 0 ? '-' : ''}{formatCurrency(Math.abs(netGrandTotal))}
                  </p>
                  <div className="text-xs">
                    {monthlyTotals.grandTotalAdvance > 0 && (
                      <span className="text-blue-500 dark:text-blue-400 mr-2">(+{formatCurrency(monthlyTotals.grandTotalAdvance)} new)</span>
                    )}
                    {monthlyTotals.grandTotalRefund > 0 && (
                      <span className="text-red-500 dark:text-red-400">(-{formatCurrency(monthlyTotals.grandTotalRefund)} out)</span>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Monthly Average</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(netGrandTotal / 12)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Best Month</p>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{bestMonth.name || 'N/A'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(bestMonth.value)}</p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Monthly Trend Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Monthly Cash Flow Trend</h4>
        <div className="flex items-end gap-1 h-32">
          {MONTHS.map((_, index) => {
            // Calculate per-room contributions for this month
            let netAmount = 0;
            Object.values(monthlyData).forEach(roomData => {
              const m = roomData.months[index];
              if (m.refund > 0) {
                netAmount += m.advance - m.refund;
              } else {
                netAmount += m.collected + m.advance;
              }
            });
            // Calculate all net values for finding max
            const netValues = MONTHS.map((_, i) => {
              let total = 0;
              Object.values(monthlyData).forEach(roomData => {
                const m = roomData.months[i];
                if (m.refund > 0) {
                  total += m.advance - m.refund;
                } else {
                  total += m.collected + m.advance;
                }
              });
              return total;
            });
            const maxTotal = Math.max(...netValues.map(v => Math.abs(v))) || 1;
            const height = Math.abs(netAmount) / maxTotal * 100;
            const isCurrent = index === currentMonth && selectedYear === currentYear;
            const isBest = netAmount === bestMonth.value && netAmount > 0;
            const isNegative = netAmount < 0;

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t transition-all ${
                    isNegative
                      ? 'bg-gradient-to-t from-red-500 to-red-400'
                      : isBest
                        ? 'bg-gradient-to-t from-amber-500 to-amber-400'
                        : isCurrent
                          ? 'bg-gradient-to-t from-blue-500 to-blue-400'
                          : 'bg-gradient-to-t from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-500'
                  }`}
                  style={{ height: `${Math.max(height, 4)}%` }}
                  title={`${FULL_MONTHS[index]}: ${isNegative ? '-' : ''}${formatCurrency(Math.abs(netAmount))}`}
                />
                <span className={`text-[10px] font-medium ${
                  isCurrent
                    ? 'text-blue-600 dark:text-blue-400'
                    : isNegative
                      ? 'text-red-500 dark:text-red-400'
                      : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {MONTHS[index]}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-t from-blue-500 to-blue-400"></div>
            <span className="text-gray-600 dark:text-gray-400">Current Month</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-t from-amber-500 to-amber-400"></div>
            <span className="text-gray-600 dark:text-gray-400">Best Month</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-t from-red-500 to-red-400"></div>
            <span className="text-gray-600 dark:text-gray-400">Cash Out</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonthlyCollectionReport;

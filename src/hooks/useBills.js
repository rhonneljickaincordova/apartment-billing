import { useState, useCallback } from 'react';
import { validateBill } from '../utils/validation';
import { getToday, isOverdue, isBillDueSoon } from '../utils/dateHelpers';
import { billsService } from '../services/firestore';
import { useFirestoreCollection } from './useFirestore';
import { getEffectiveRates } from '../utils/rateHelpers';

/**
 * Custom hook for managing bills
 * Handles CRUD operations with validation and Firestore persistence
 */
export function useBills(rooms, settings, tenants = []) {
  const {
    data: bills,
    loading,
    error: storageError,
    add,
    update,
    remove
  } = useFirestoreCollection(billsService, []);

  const [billForm, setBillForm] = useState({
    id: null,
    roomId: '',
    dueDate: getToday(),
    lastMonthReading: 0,
    currentReading: 0,
    includeAirconCleaning: false,
    includeWifi: true,
    paid: false,
    applyDeposit: false,
    depositAmount: 0,
    applyPenalty: false,
    penaltyAmount: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * Calculate bill amounts based on readings and settings
   * Uses tenant custom rates if available, otherwise falls back to global settings
   * @param {object} formData - Bill form data
   * @param {object} room - Room data
   * @returns {object} - Calculated bill data
   */
  const calculateBillAmounts = useCallback(
    (formData, room) => {
      // Get effective rates (considers tenant custom rates)
      const effectiveRates = getEffectiveRates(formData.roomId, tenants, settings);

      return {
        electricityBill: (formData.currentReading - formData.lastMonthReading) * effectiveRates.electricityRate,
        waterBill: (room?.persons || 0) * effectiveRates.waterRate,
        wifiBill: formData.includeWifi !== false ? effectiveRates.wifiRate : 0,
        rentBill: room?.rent || 0,
        airconCleaningBill: formData.includeAirconCleaning ? (settings.airconCleaningRate || 0) : 0,
        mineralWaterBill: (formData.mineralWaterCount || 0) * (settings.mineralWaterRate || 0),
        mineralWaterCount: formData.mineralWaterCount || 0,
        // Store rates used for historical reference
        ratesUsed: {
          electricityRate: effectiveRates.electricityRate,
          waterRate: effectiveRates.waterRate,
          wifiRate: effectiveRates.wifiRate,
          mineralWaterRate: settings.mineralWaterRate || 0,
        },
      };
    },
    [settings, tenants]
  );

  /**
   * Get total amount for a bill
   * @param {object} bill - Bill object
   * @returns {number}
   */
  const getBillTotal = useCallback((bill) => {
    const baseTotal = (bill.rentBill || 0) + (bill.electricityBill || 0) + (bill.waterBill || 0) + (bill.wifiBill || 0) + (bill.airconCleaningBill || 0) + (bill.mineralWaterBill || 0);
    const penalty = (bill.penaltyApplied && bill.penaltyAmount) ? bill.penaltyAmount : 0;
    return baseTotal + penalty;
  }, []);

  /**
   * Save bill (create or update)
   * @returns {{ success: boolean, message: string }}
   */
  const saveBill = useCallback(async () => {
    const validation = validateBill(billForm);
    setErrors(validation.errors);

    if (!validation.isValid) {
      return { success: false, message: 'Please fix the errors before saving.' };
    }

    const room = rooms.find((r) => r.id === billForm.roomId);
    if (!room) {
      return { success: false, message: 'Room not found' };
    }

    try {
      const billData = {
        roomId: billForm.roomId,
        dueDate: billForm.dueDate,
        lastMonthReading: billForm.lastMonthReading,
        currentReading: billForm.currentReading,
        includeAirconCleaning: billForm.includeAirconCleaning || false,
        includeWifi: billForm.includeWifi !== false,
        paid: billForm.paid,
        ...calculateBillAmounts(billForm, room),
      };

      // Handle penalty application
      if (billForm.applyPenalty && billForm.penaltyAmount > 0) {
        billData.penaltyApplied = true;
        billData.penaltyAmount = billForm.penaltyAmount;
      }

      // Handle deposit application
      if (billForm.applyDeposit && billForm.depositAmount > 0) {
        const tenant = tenants.find(t => t.roomId === billForm.roomId && t.isActive);
        if (tenant && !tenant.depositUsed) {
          billData.depositApplied = true;
          billData.depositAmount = billForm.depositAmount;
          billData.amountPaid = billForm.depositAmount;

          // Check if deposit covers full amount (including penalty if applied)
          const total = getBillTotal({ ...billData });
          if (billForm.depositAmount >= total) {
            billData.paid = true;
            billData.paidDate = getToday();
          }

          // Update tenant to mark deposit as used
          const { tenantsService } = await import('../services/firestore');
          await tenantsService.update(tenant.id, {
            depositUsed: true,
            depositUsedDate: getToday(),
            depositBillId: isEditing ? billForm.id : 'pending',
          });
        }
      }

      let message;

      if (isEditing) {
        await update(billForm.id, billData);
        message = 'Bill updated successfully!';
      } else {
        const newBillId = await add(billData);
        // Update tenant with actual bill ID if deposit was applied
        if (billData.depositApplied) {
          const tenant = tenants.find(t => t.roomId === billForm.roomId && t.isActive);
          if (tenant) {
            const { tenantsService } = await import('../services/firestore');
            await tenantsService.update(tenant.id, {
              depositBillId: newBillId,
            });
          }
        }
        const parts = ['Bill created successfully!'];
        if (billData.depositApplied) {
          parts.push(`Deposit of ₱${billData.depositAmount.toFixed(2)} applied.`);
        }
        if (billData.penaltyApplied) {
          parts.push(`Penalty of ₱${billData.penaltyAmount.toFixed(2)} added.`);
        }
        message = parts.join(' ');
      }

      resetForm();
      return { success: true, message };
    } catch (error) {
      console.error('Error saving bill:', error);
      return { success: false, message: 'Failed to save bill. Please try again.' };
    }
  }, [billForm, rooms, isEditing, calculateBillAmounts, add, update]);

  /**
   * Start editing a bill
   * @param {object} bill - Bill to edit
   */
  const editBill = useCallback((bill) => {
    setBillForm(bill);
    setIsEditing(true);
    setErrors({});
  }, []);

  /**
   * Delete a bill by ID
   * @param {string} id - Bill ID to delete
   * @returns {{ success: boolean, message: string }}
   */
  const deleteBill = useCallback(
    async (id) => {
      try {
        await remove(id);
        return { success: true, message: 'Bill deleted successfully!' };
      } catch (error) {
        console.error('Error deleting bill:', error);
        return { success: false, message: 'Failed to delete bill.' };
      }
    },
    [remove]
  );

  /**
   * Delete all bills for a specific room
   * @param {string} roomId - Room ID
   */
  const deleteBillsByRoomId = useCallback(
    async (roomId) => {
      const billsToDelete = bills.filter((b) => b.roomId === roomId);
      for (const bill of billsToDelete) {
        await remove(bill.id);
      }
    },
    [bills, remove]
  );

  /**
   * Toggle bill paid status
   * @param {string} billId - Bill ID
   * @returns {{ success: boolean, message: string }}
   */
  const togglePaid = useCallback(
    async (billId) => {
      try {
        const bill = bills.find((b) => b.id === billId);
        if (!bill) {
          return { success: false, message: 'Bill not found.' };
        }

        const total = getBillTotal(bill);
        const updateData = bill.paid
          ? { paid: false, paidDate: null, amountPaid: 0 }
          : { paid: true, paidDate: getToday(), amountPaid: total };

        await update(billId, updateData);

        return {
          success: true,
          message: bill.paid ? 'Bill marked as unpaid' : 'Bill marked as paid!',
        };
      } catch (error) {
        console.error('Error updating bill status:', error);
        return { success: false, message: 'Failed to update bill status.' };
      }
    },
    [bills, update, getBillTotal]
  );

  /**
   * Record a payment for a bill (supports partial payments)
   * @param {string} billId - Bill ID
   * @param {number} amount - Payment amount
   * @returns {{ success: boolean, message: string }}
   */
  const recordPayment = useCallback(
    async (billId, amount) => {
      try {
        const bill = bills.find((b) => b.id === billId);
        if (!bill) {
          return { success: false, message: 'Bill not found.' };
        }

        const total = getBillTotal(bill);
        const currentAmountPaid = bill.amountPaid || 0;
        const newAmountPaid = currentAmountPaid + amount;

        if (amount <= 0) {
          return { success: false, message: 'Payment amount must be greater than 0.' };
        }

        const remaining = total - newAmountPaid;

        const updateData = {
          amountPaid: newAmountPaid,
          paid: newAmountPaid >= total,
          paidDate: newAmountPaid >= total ? getToday() : null,
        };

        await update(billId, updateData);

        if (newAmountPaid >= total) {
          return { success: true, message: 'Bill fully paid!' };
        }
        return {
          success: true,
          message: `Payment of ₱${amount.toFixed(2)} recorded. Remaining: ₱${remaining.toFixed(2)}`,
        };
      } catch (error) {
        console.error('Error recording payment:', error);
        return { success: false, message: 'Failed to record payment.' };
      }
    },
    [bills, update, getBillTotal]
  );

  /**
   * Get the payment status of a bill
   * @param {object} bill - Bill object
   * @returns {'paid' | 'partial' | 'pending' | 'overdue'}
   */
  const getBillStatus = useCallback(
    (bill) => {
      const total = getBillTotal(bill);
      const amountPaid = bill.amountPaid || 0;

      if (amountPaid >= total || bill.paid) return 'paid';
      if (amountPaid > 0) return 'partial';
      if (isOverdue(bill.dueDate)) return 'overdue';
      return 'pending';
    },
    [getBillTotal]
  );

  /**
   * Get remaining balance for a bill
   * @param {object} bill - Bill object
   * @returns {number}
   */
  const getRemainingBalance = useCallback(
    (bill) => {
      const total = getBillTotal(bill);
      const amountPaid = bill.amountPaid || 0;
      return Math.max(0, total - amountPaid);
    },
    [getBillTotal]
  );

  /**
   * Get bills with partial payments
   * @returns {array}
   */
  const getPartialBills = useCallback(() => {
    return bills.filter((b) => {
      const total = getBillTotal(b);
      const amountPaid = b.amountPaid || 0;
      return amountPaid > 0 && amountPaid < total;
    });
  }, [bills, getBillTotal]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setBillForm({
      id: null,
      roomId: '',
      dueDate: getToday(),
      lastMonthReading: 0,
      currentReading: 0,
      includeAirconCleaning: false,
      includeWifi: true,
      paid: false,
      applyDeposit: false,
      depositAmount: 0,
      applyPenalty: false,
      penaltyAmount: 0,
    });
    setIsEditing(false);
    setErrors({});
  }, []);

  /**
   * Get the latest bill for a specific room (sorted by due date)
   * @param {string} roomId - Room ID
   * @returns {object|null}
   */
  const getLatestBillForRoom = useCallback(
    (roomId) => {
      const roomBills = bills.filter((b) => b.roomId === roomId);
      if (roomBills.length === 0) return null;

      // Sort by due date descending and return the most recent
      return roomBills.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))[0];
    },
    [bills]
  );

  /**
   * Update a single form field
   * Auto-fills lastMonthReading and dueDate when roomId changes based on latest bill and tenant
   * @param {string} field - Field name
   * @param {any} value - New value
   */
  const updateFormField = useCallback((field, value) => {
    setBillForm((prev) => {
      const updates = { [field]: value };

      // Auto-fill lastMonthReading and dueDate when room is selected (only for new bills)
      if (field === 'roomId' && value && !isEditing) {
        // Auto-fill lastMonthReading from latest bill
        const latestBill = getLatestBillForRoom(value);
        if (latestBill && latestBill.currentReading) {
          updates.lastMonthReading = latestBill.currentReading;
        } else {
          updates.lastMonthReading = 0;
        }

        // Auto-fill dueDate from tenant's rentDueDay
        const tenant = tenants.find((t) => t.roomId === value);
        if (tenant && tenant.rentDueDay) {
          // Calculate the next occurrence of this day
          const today = new Date();
          const currentMonth = today.getMonth();
          const currentYear = today.getFullYear();
          const dueDay = parseInt(tenant.rentDueDay);

          // Create date with the due day in current month
          let dueDate = new Date(currentYear, currentMonth, dueDay);

          // If that date has passed, use next month
          if (dueDate < today) {
            dueDate = new Date(currentYear, currentMonth + 1, dueDay);
          }

          updates.dueDate = dueDate.toISOString().split('T')[0];
        } else {
          updates.dueDate = getToday();
        }
      }

      return { ...prev, ...updates };
    });
    // Clear error for the field being updated
    setErrors((prev) => {
      if (prev[field]) {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, [isEditing, getLatestBillForRoom, tenants]);

  /**
   * Get a bill by ID
   * @param {string} id - Bill ID
   * @returns {object|undefined}
   */
  const getBillById = useCallback(
    (id) => {
      return bills.find((b) => b.id === id);
    },
    [bills]
  );

  /**
   * Get bills for a specific room
   * @param {string} roomId - Room ID
   * @returns {array}
   */
  const getBillsByRoomId = useCallback(
    (roomId) => {
      return bills.filter((b) => b.roomId === roomId);
    },
    [bills]
  );

  /**
   * Get paid bills
   * @returns {array}
   */
  const getPaidBills = useCallback(() => {
    return bills.filter((b) => b.paid);
  }, [bills]);

  /**
   * Get unpaid bills
   * @returns {array}
   */
  const getUnpaidBills = useCallback(() => {
    return bills.filter((b) => !b.paid);
  }, [bills]);

  /**
   * Get overdue bills
   * @returns {array}
   */
  const getOverdueBills = useCallback(() => {
    return bills.filter((b) => !b.paid && isOverdue(b.dueDate));
  }, [bills]);

  /**
   * Get bills due soon
   * @returns {array}
   */
  const getBillsDueSoon = useCallback(() => {
    return bills.filter((b) => !b.paid && isBillDueSoon(b.dueDate));
  }, [bills]);

  /**
   * Check if a bill is overdue
   * @param {object} bill - Bill object
   * @returns {boolean}
   */
  const isBillOverdue = useCallback((bill) => {
    return !bill.paid && isOverdue(bill.dueDate);
  }, []);

  /**
   * Calculate total collected revenue
   * @returns {number}
   */
  const getTotalCollected = useCallback(() => {
    return getPaidBills().reduce((sum, b) => sum + getBillTotal(b), 0);
  }, [getPaidBills, getBillTotal]);

  /**
   * Calculate total pending revenue
   * @returns {number}
   */
  const getTotalPending = useCallback(() => {
    return getUnpaidBills().reduce((sum, b) => sum + getBillTotal(b), 0);
  }, [getUnpaidBills, getBillTotal]);

  /**
   * Calculate total billed amount
   * @returns {number}
   */
  const getTotalBilled = useCallback(() => {
    return bills.reduce((sum, b) => sum + getBillTotal(b), 0);
  }, [bills, getBillTotal]);

  /**
   * Print a bill
   * @param {object} bill - Bill to print
   */
  const printBill = useCallback(
    (bill) => {
      const room = rooms.find((r) => r.id === bill.roomId);
      const total = getBillTotal(bill);
      const isPaid = bill.paid || false;
      const paidDate = bill.paidDate || null;

      // Format date to "January 2, 2026" format
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };

      const formattedDueDate = formatDate(bill.dueDate);
      const formattedPaidDate = paidDate ? formatDate(paidDate) : null;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Bill - ${room?.name || 'Room'} - ${bill.dueDate}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; position: relative; }
              .header h1 { margin: 0; font-size: 28px; color: #333; }
              .header p { margin: 5px 0; color: #666; }
              .payment-status { position: absolute; top: 0; right: 0; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; }
              .payment-status.paid { background-color: #10b981; color: white; }
              .payment-status.unpaid { background-color: #ef4444; color: white; }
              .paid-date { text-align: center; margin: 10px 0; padding: 10px; background-color: #d1fae5; border-radius: 5px; font-size: 14px; color: #065f46; font-weight: bold; }
              .bill-info { margin-bottom: 30px; }
              .bill-info div { display: flex; justify-content: space-between; margin: 10px 0; font-size: 16px; }
              .bill-info .label { font-weight: bold; color: #555; }
              .line-items { margin: 30px 0; }
              .line-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #ddd; font-size: 16px; }
              .line-item.total { border-top: 3px solid #333; border-bottom: 3px double #333; font-size: 20px; font-weight: bold; margin-top: 15px; padding-top: 15px; }
              .footer { margin-top: 50px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>MONTHLY BILL</h1>
              <div class="payment-status ${isPaid ? 'paid' : 'unpaid'}">${isPaid ? '✓ PAID' : 'NOT PAID'}</div>
            </div>
            ${isPaid && formattedPaidDate ? `<div class="paid-date">Payment Received: ${formattedPaidDate}</div>` : ''}
            <div class="bill-info">
              <div><span class="label">Room:</span><span>${room?.name || 'Unknown'}</span></div>
              <div><span class="label">Due Date:</span><span>${formattedDueDate}</span></div>
              <div><span class="label">Number of Persons:</span><span>${room?.persons || 1}</span></div>
            </div>
            <div class="line-items">
              <div class="line-item"><span>Rent</span><span>₱${(bill.rentBill || 0).toFixed(2)}</span></div>
              ${bill.wifiBill > 0 ? `<div class="line-item"><span>WiFi</span><span>₱${(bill.wifiBill || 0).toFixed(2)}</span></div>` : ''}
              <div class="line-item"><span>Water</span><span>₱${(bill.waterBill || 0).toFixed(2)}</span></div>
              <div class="line-item"><span>Electricity (${bill.lastMonthReading} → ${bill.currentReading})</span><span>₱${(bill.electricityBill || 0).toFixed(2)}</span></div>
              ${bill.airconCleaningBill > 0 ? `<div class="line-item"><span>Aircon Cleaning</span><span>₱${(bill.airconCleaningBill || 0).toFixed(2)}</span></div>` : ''}
              ${bill.mineralWaterBill > 0 ? `<div class="line-item"><span>Mineral Water (${bill.mineralWaterCount || 0})</span><span>₱${(bill.mineralWaterBill || 0).toFixed(2)}</span></div>` : ''}
              <div class="line-item total"><span>TOTAL</span><span>₱${total.toFixed(2)}</span></div>
            </div>
            <div class="footer">
              <p>Generated on ${new Date().toLocaleDateString()}</p>
              <p>Thank you for your payment</p>
            </div>
            <script>window.onload = function() { window.print(); };</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    },
    [rooms, getBillTotal]
  );

  return {
    // State
    bills,
    billForm,
    isEditing,
    errors,
    storageError,
    loading,

    // Actions
    saveBill,
    editBill,
    deleteBill,
    deleteBillsByRoomId,
    togglePaid,
    recordPayment,
    resetForm,
    updateFormField,
    printBill,

    // Helpers
    getBillById,
    getBillsByRoomId,
    getLatestBillForRoom,
    getPaidBills,
    getUnpaidBills,
    getOverdueBills,
    getPartialBills,
    getBillsDueSoon,
    isBillOverdue,
    getBillTotal,
    getBillStatus,
    getRemainingBalance,
    getTotalCollected,
    getTotalPending,
    getTotalBilled,
  };
}

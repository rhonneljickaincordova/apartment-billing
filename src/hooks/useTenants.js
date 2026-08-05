import { useState, useCallback } from 'react';
import { writeBatch, doc, collection, serverTimestamp } from 'firebase/firestore';
import { validateTenant } from '../utils/validation';
import { tenantsService, COLLECTIONS } from '../services/firestore';
import { useFirestoreCollection } from './useFirestore';
import { db } from '../config/firebase';

/**
 * Custom hook for managing tenants
 * Handles CRUD operations with validation and Firestore persistence
 */
export function useTenants() {
  const {
    data: tenants,
    loading,
    error: storageError,
    add,
    update,
    remove
  } = useFirestoreCollection(tenantsService, []);

  const [tenantForm, setTenantForm] = useState({
    id: null,
    fullName: '',
    phoneNumber: '',
    validIdImages: [],
    emergencyContactName: '',
    emergencyContactNumber: '',
    relationship: '',
    contractSignature: null,
    contractSignedDate: null,
    roomId: '',
    moveInDate: '',
    moveOutDate: null,
    leaseStartDate: '',
    leaseEndDate: '',
    rentDueDay: null,
    advancePayment: 0,
    advancePaymentDate: '',
    securityDeposit: 0,
    earlyTerminationPenalty: 0,
    isActive: true,
    customRates: {
      electricityRate: null,
      waterRate: null,
      wifiRate: null,
    },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * Save tenant (create or update)
   * @returns {{ success: boolean, message: string }}
   */
  const saveTenant = useCallback(async () => {
    const validation = validateTenant(tenantForm);
    setErrors(validation.errors);

    if (!validation.isValid) {
      return { success: false, message: 'Please fix the errors before saving.' };
    }

    try {
      const tenantData = {
        fullName: tenantForm.fullName.trim(),
        phoneNumber: tenantForm.phoneNumber.trim(),
        validIdImages: tenantForm.validIdImages || [],
        emergencyContactName: tenantForm.emergencyContactName.trim(),
        emergencyContactNumber: tenantForm.emergencyContactNumber.trim(),
        relationship: tenantForm.relationship.trim(),
        contractSignature: tenantForm.contractSignature || null,
        contractSignedDate: tenantForm.contractSignedDate || null,
        roomId: tenantForm.roomId || '',
        moveInDate: tenantForm.moveInDate || '',
        moveOutDate: tenantForm.moveOutDate || null,
        leaseStartDate: tenantForm.leaseStartDate || '',
        leaseEndDate: tenantForm.leaseEndDate || '',
        rentDueDay: tenantForm.rentDueDay || null,
        advancePayment: tenantForm.advancePayment || 0,
        advancePaymentDate: tenantForm.advancePaymentDate || '',
        securityDeposit: tenantForm.securityDeposit || 0,
        earlyTerminationPenalty: tenantForm.earlyTerminationPenalty || 0,
        isActive: tenantForm.isActive,
        customRates: tenantForm.customRates || {
          electricityRate: null,
          waterRate: null,
          wifiRate: null,
        },
        moveOutDetails: tenantForm.moveOutDetails || null,
      };

      let message;

      if (isEditing) {
        await update(tenantForm.id, tenantData);
        message = 'Tenant updated successfully!';
      } else {
        await add(tenantData);
        message = 'Tenant added successfully!';
      }

      resetForm();
      return { success: true, message };
    } catch (error) {
      console.error('Error saving tenant:', error);
      return { success: false, message: 'Failed to save tenant. Please try again.' };
    }
  }, [tenantForm, isEditing, add, update]);

  /**
   * Start editing a tenant
   * @param {object} tenant - Tenant to edit
   */
  const editTenant = useCallback((tenant) => {
    setTenantForm(tenant);
    setIsEditing(true);
    setErrors({});
  }, []);

  /**
   * Delete a tenant by ID
   * @param {string} id - Tenant ID to delete
   * @returns {{ success: boolean, message: string }}
   */
  const deleteTenant = useCallback(
    async (id) => {
      try {
        await remove(id);
        return { success: true, message: 'Tenant deleted successfully!' };
      } catch (error) {
        console.error('Error deleting tenant:', error);
        return { success: false, message: 'Failed to delete tenant.' };
      }
    },
    [remove]
  );

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setTenantForm({
      id: null,
      fullName: '',
      phoneNumber: '',
      validIdImages: [],
      emergencyContactName: '',
      emergencyContactNumber: '',
      relationship: '',
      contractSignature: null,
      contractSignedDate: null,
      roomId: '',
      moveInDate: '',
      moveOutDate: null,
      leaseStartDate: '',
      leaseEndDate: '',
      rentDueDay: null,
      advancePayment: 0,
      advancePaymentDate: '',
      securityDeposit: 0,
      earlyTerminationPenalty: 0,
      isActive: true,
      customRates: {
        electricityRate: null,
        waterRate: null,
        wifiRate: null,
      },
    });
    setIsEditing(false);
    setErrors({});
  }, []);

  /**
   * Update a single form field
   * @param {string} field - Field name
   * @param {any} value - New value
   */
  const updateFormField = useCallback((field, value) => {
    setTenantForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for the field being updated
    setErrors((prev) => {
      if (prev[field]) {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  /**
   * Add a valid ID image
   * @param {string} imageData - Base64 image data
   */
  const addValidIdImage = useCallback((imageData) => {
    setTenantForm((prev) => ({
      ...prev,
      validIdImages: [...(prev.validIdImages || []), imageData]
    }));
  }, []);

  /**
   * Remove a valid ID image by index
   * @param {number} index - Image index to remove
   */
  const removeValidIdImage = useCallback((index) => {
    setTenantForm((prev) => ({
      ...prev,
      validIdImages: prev.validIdImages.filter((_, i) => i !== index)
    }));
  }, []);

  /**
   * Set contract signature
   * @param {string} signatureData - Base64 signature data
   */
  const setContractSignature = useCallback((signatureData) => {
    setTenantForm((prev) => ({
      ...prev,
      contractSignature: signatureData,
      contractSignedDate: new Date().toISOString().split('T')[0]
    }));
  }, []);

  /**
   * Clear contract signature
   */
  const clearContractSignature = useCallback(() => {
    setTenantForm((prev) => ({
      ...prev,
      contractSignature: null
    }));
  }, []);

  /**
   * Get a tenant by ID
   * @param {string} id - Tenant ID
   * @returns {object|undefined}
   */
  const getTenantById = useCallback(
    (id) => {
      return tenants.find((t) => t.id === id);
    },
    [tenants]
  );

  /**
   * Get tenants by room ID
   * @param {string} roomId - Room ID
   * @returns {array}
   */
  const getTenantsByRoom = useCallback(
    (roomId) => {
      return tenants.filter((t) => t.roomId === roomId);
    },
    [tenants]
  );

  /**
   * Get active tenants only
   * @returns {array}
   */
  const getActiveTenants = useCallback(() => {
    return tenants.filter((t) => t.isActive);
  }, [tenants]);

  /**
   * Toggle tenant active status
   * @param {object} tenant - Tenant to toggle
   * @returns {{ success: boolean, message: string }}
   */
  const toggleTenantStatus = useCallback(
    async (tenant) => {
      try {
        const newStatus = !tenant.isActive;
        await update(tenant.id, { isActive: newStatus });
        return {
          success: true,
          message: `Tenant marked as ${newStatus ? 'active' : 'inactive'}!`,
        };
      } catch (error) {
        console.error('Error toggling tenant status:', error);
        return { success: false, message: 'Failed to update tenant status.' };
      }
    },
    [update]
  );

  /**
   * Move out a tenant - sets inactive status and records move-out date with refund details
   * @param {object} tenant - Tenant to move out
   * @param {object} moveOutDetails - Move out details including refund
   * @returns {{ success: boolean, message: string }}
   */
  const moveOutTenant = useCallback(
    async (tenant, moveOutDetails = {}) => {
      try {
        const {
          moveOutDate = new Date().toISOString().split('T')[0],
          moveOutReason = 'normal',
          moveOutReasonLabel = 'Normal Move-Out',
          refundAmount = 0,
          deductions = 0,
          notes = '',
          isEarlyTermination = false,
          monthsStayed = 0,
        } = moveOutDetails;

        await update(tenant.id, {
          isActive: false,
          moveOutDate,
          moveOutDetails: {
            moveOutReason,
            moveOutReasonLabel,
            refundAmount,
            deductions,
            notes,
            isEarlyTermination,
            monthsStayed,
            processedDate: new Date().toISOString(),
          }
        });

        const refundMessage = refundAmount > 0
          ? ` Refund of ₱${refundAmount.toFixed(2)} recorded.`
          : ' No refund applicable.';

        return {
          success: true,
          message: `${tenant.fullName} has been moved out.${refundMessage}`,
        };
      } catch (error) {
        console.error('Error moving out tenant:', error);
        return { success: false, message: 'Failed to move out tenant.' };
      }
    },
    [update]
  );

  /**
   * Transfer a tenant to a new room without moving out.
   *
   * Atomically (via writeBatch):
   *   - flips tenant.roomId to newRoomId
   *   - overwrites tenant.securityDeposit / tenant.advancePayment with the reconciled values
   *   - appends a roomHistory entry capturing the transfer
   *   - creates a bill.type='roomTransfer' document (positive on upward, negative auto-paid on downward)
   *
   * @param {object} tenant - Tenant being transferred
   * @param {object} details - {
   *     newRoomId, newRoomRent, oldRoomId, oldRoomRent, transferDate, notes,
   *     finalElectricityReading,
   *     customRatesChoice ('keep'|'reset'|'edit'), customRatesAtTransfer,
   *     reconciledDeposit, reconciledAdvance,
   *     depositTopUp, advanceTopUp,
   *     overrideReason,
   *     refundStyle ('cash'|'credit'|'keep-surplus'), payNow,
   *   }
   * @returns {{ success: boolean, message: string, transferBillId?: string }}
   */
  const transferTenantRoom = useCallback(
    async (tenant, details) => {
      if (!tenant?.id) return { success: false, message: 'Missing tenant.' };
      if (!details?.newRoomId) return { success: false, message: 'Destination room is required.' };
      if (details.newRoomId === tenant.roomId) {
        return { success: false, message: 'Destination room must be different from the current room.' };
      }

      const totalTopUp = (details.depositTopUp || 0) + (details.advanceTopUp || 0);
      const isDownward = totalTopUp < 0;

      try {
        const batch = writeBatch(db);

        const tenantRef = doc(db, COLLECTIONS.TENANTS, tenant.id);
        const billRef = doc(collection(db, COLLECTIONS.BILLS));

        const historyEntry = {
          fromRoomId: details.oldRoomId || tenant.roomId,
          toRoomId: details.newRoomId,
          transferDate: details.transferDate,
          notes: details.notes || '',
          finalElectricityReading: details.finalElectricityReading ?? null,
          customRatesChoice: details.customRatesChoice || 'keep',
          customRatesAtTransfer: details.customRatesAtTransfer || null,
          previousDeposit: tenant.securityDeposit || 0,
          previousAdvance: tenant.advancePayment || 0,
          reconciledDeposit: details.reconciledDeposit || 0,
          reconciledAdvance: details.reconciledAdvance || 0,
          depositTopUp: details.depositTopUp || 0,
          advanceTopUp: details.advanceTopUp || 0,
          overrideReason: details.overrideReason || '',
          refundStyle: isDownward ? (details.refundStyle || 'cash') : null,
          topUpBillId: billRef.id,
          createdAt: new Date().toISOString(),
        };

        const nextHistory = [...(tenant.roomHistory || []), historyEntry];

        const tenantUpdate = {
          roomId: details.newRoomId,
          securityDeposit: details.reconciledDeposit || 0,
          advancePayment: details.reconciledAdvance || 0,
          roomHistory: nextHistory,
          updatedAt: serverTimestamp(),
        };

        if (details.customRatesChoice === 'reset') {
          tenantUpdate.customRates = { electricityRate: null, waterRate: null, wifiRate: null };
        } else if (details.customRatesChoice === 'edit' && details.customRatesAtTransfer) {
          tenantUpdate.customRates = { ...details.customRatesAtTransfer };
        }

        batch.update(tenantRef, tenantUpdate);

        const billPayments = isDownward
          ? [
              {
                id: `refund-${Date.now()}`,
                amount: totalTopUp,
                date: details.transferDate,
                method: details.refundStyle === 'credit' ? 'Credit' : 'Cash',
                notes: `Room transfer refund (${details.refundStyle || 'cash'})`,
                createdAt: new Date().toISOString(),
              },
            ]
          : [];

        const billData = {
          type: 'roomTransfer',
          roomId: details.newRoomId,
          tenantId: tenant.id,
          dueDate: details.transferDate,
          depositTopUp: details.depositTopUp || 0,
          advanceTopUp: details.advanceTopUp || 0,
          totalAmount: totalTopUp,
          paid: isDownward || (details.payNow && totalTopUp === 0),
          payments: billPayments,
          transferHistoryIndex: nextHistory.length - 1,
          overrideReason: details.overrideReason || '',
          rentBill: 0,
          electricityBill: 0,
          waterBill: 0,
          wifiBill: 0,
          airconCleaningBill: 0,
          mineralWaterBill: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        batch.set(billRef, billData);

        await batch.commit();

        return {
          success: true,
          message: isDownward
            ? `${tenant.fullName} transferred. Refund of ₱${Math.abs(totalTopUp).toFixed(2)} recorded.`
            : totalTopUp > 0
              ? `${tenant.fullName} transferred. Top-up bill of ₱${totalTopUp.toFixed(2)} created.`
              : `${tenant.fullName} transferred. No top-up needed.`,
          transferBillId: billRef.id,
        };
      } catch (error) {
        console.error('Error transferring tenant:', error);
        return { success: false, message: 'Failed to transfer tenant.' };
      }
    },
    []
  );

  /**
   * Revert a tenant's move-out — restores active status and clears move-out fields.
   * Does NOT touch the refund record (financial fact — handle separately if incorrect).
   * Room status is toggled by the caller (mirrors the transfer flow pattern).
   * @param {object} tenant - Tenant to revert
   * @returns {{ success: boolean, message: string }}
   */
  const revertMoveOut = useCallback(
    async (tenant) => {
      if (!tenant?.id) return { success: false, message: 'Missing tenant.' };
      if (!tenant.moveOutDate) {
        return { success: false, message: 'Tenant has not moved out.' };
      }
      try {
        await update(tenant.id, {
          isActive: true,
          moveOutDate: null,
          moveOutDetails: null,
        });
        return {
          success: true,
          message: `${tenant.fullName}'s move-out has been reverted.`,
        };
      } catch (error) {
        console.error('Error reverting move-out:', error);
        return { success: false, message: 'Failed to revert move-out.' };
      }
    },
    [update]
  );

  return {
    // State
    tenants,
    tenantForm,
    isEditing,
    errors,
    storageError,
    loading,

    // Actions
    saveTenant,
    editTenant,
    deleteTenant,
    resetForm,
    updateFormField,
    toggleTenantStatus,
    moveOutTenant,
    revertMoveOut,
    transferTenantRoom,

    // Image handling
    addValidIdImage,
    removeValidIdImage,

    // Signature handling
    setContractSignature,
    clearContractSignature,

    // Helpers
    getTenantById,
    getTenantsByRoom,
    getActiveTenants,
  };
}

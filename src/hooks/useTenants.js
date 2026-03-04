import { useState, useCallback } from 'react';
import { validateTenant } from '../utils/validation';
import { tenantsService } from '../services/firestore';
import { useFirestoreCollection } from './useFirestore';

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

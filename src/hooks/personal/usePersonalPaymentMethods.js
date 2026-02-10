import { useState, useEffect, useCallback, useMemo } from 'react';
import { personalPaymentMethodService } from '../../services/personal';

/**
 * Custom hook for managing payment methods
 */
export function usePersonalPaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Subscribe to real-time updates and initialize defaults
  useEffect(() => {
    setLoading(true);
    let unsubscribe = () => {};

    const init = async () => {
      // First, clean up any duplicates
      await personalPaymentMethodService.removeDuplicates();
      // Then initialize defaults if needed
      await personalPaymentMethodService.initializeDefaults();
      setInitialized(true);
    };

    if (!initialized) {
      init();
    }

    unsubscribe = personalPaymentMethodService.subscribe((data) => {
      setPaymentMethods(data);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [initialized]);

  // Add payment method
  const addPaymentMethod = useCallback(async (data) => {
    try {
      const result = await personalPaymentMethodService.add(data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Update payment method
  const updatePaymentMethod = useCallback(async (id, data) => {
    try {
      const result = await personalPaymentMethodService.update(id, data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Update balance
  const updateBalance = useCallback(async (id, newBalance) => {
    try {
      const result = await personalPaymentMethodService.updateBalance(id, newBalance);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Delete payment method
  const deletePaymentMethod = useCallback(async (id) => {
    try {
      await personalPaymentMethodService.delete(id);
      return id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Get payment method by ID
  const getById = useCallback((id) => {
    return paymentMethods.find(p => p.id === id) || null;
  }, [paymentMethods]);

  // Get payment method options for select
  const getPaymentMethodOptions = useCallback(() => {
    return paymentMethods.map(p => ({
      value: p.id,
      label: p.name,
      icon: p.icon,
      type: p.type
    }));
  }, [paymentMethods]);

  // Group by type
  const groupedByType = useMemo(() => {
    const groups = {
      cash: [],
      card: [],
      ewallet: [],
      bank: [],
    };

    paymentMethods.forEach(pm => {
      const type = pm.type || 'cash';
      if (groups[type]) {
        groups[type].push(pm);
      } else {
        groups.cash.push(pm);
      }
    });

    return groups;
  }, [paymentMethods]);

  // Total balance across all payment methods
  const totalBalance = useMemo(() => {
    return paymentMethods.reduce((sum, p) => sum + (p.balance || 0), 0);
  }, [paymentMethods]);

  return {
    // State
    paymentMethods,
    groupedByType,
    totalBalance,
    loading,
    error,

    // Actions
    addPaymentMethod,
    updatePaymentMethod,
    updateBalance,
    deletePaymentMethod,
    getById,
    getPaymentMethodOptions,
  };
}

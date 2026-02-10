import { useState, useEffect, useCallback, useMemo } from 'react';
import { personalRecurringService, personalTransactionService } from '../../services/personal';

/**
 * Calculate next due date based on frequency
 */
function calculateNextDueDate(currentDate, frequency) {
  const date = new Date(currentDate);

  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }

  return date.toISOString().split('T')[0];
}

/**
 * Custom hook for managing recurring transactions
 */
export function usePersonalRecurring(categories = [], paymentMethods = []) {
  const [recurring, setRecurring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to real-time updates
  useEffect(() => {
    setLoading(true);
    const unsubscribe = personalRecurringService.subscribe((data) => {
      setRecurring(data);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  // Add recurring transaction
  const addRecurring = useCallback(async (data) => {
    try {
      const result = await personalRecurringService.add(data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Update recurring transaction
  const updateRecurring = useCallback(async (id, data) => {
    try {
      const result = await personalRecurringService.update(id, data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Toggle active status
  const toggleActive = useCallback(async (id, isActive) => {
    try {
      const result = await personalRecurringService.toggleActive(id, isActive);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Delete recurring transaction
  const deleteRecurring = useCallback(async (id) => {
    try {
      await personalRecurringService.delete(id);
      return id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Process due recurring transactions (create actual transactions)
  const processDueTransactions = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const dueItems = recurring.filter(r => r.isActive && r.nextDueDate <= today);

    const results = [];

    for (const item of dueItems) {
      try {
        // Create the transaction
        const transaction = {
          ...item.transactionTemplate,
          date: item.nextDueDate,
          recurringId: item.id,
        };
        await personalTransactionService.add(transaction);

        // Update the recurring item with new next due date
        const newNextDueDate = calculateNextDueDate(item.nextDueDate, item.frequency);
        await personalRecurringService.markProcessed(item.id, newNextDueDate);

        results.push({ id: item.id, success: true });
      } catch (err) {
        console.error('Error processing recurring transaction:', err);
        results.push({ id: item.id, success: false, error: err.message });
      }
    }

    return results;
  }, [recurring]);

  // Get recurring by ID
  const getById = useCallback((id) => {
    return recurring.find(r => r.id === id) || null;
  }, [recurring]);

  // Recurring with additional info
  const recurringWithInfo = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    return recurring.map(item => {
      const category = categories.find(c => c.id === item.transactionTemplate?.categoryId);
      const paymentMethod = paymentMethods.find(p => p.id === item.transactionTemplate?.paymentMethodId);

      const isDue = item.isActive && item.nextDueDate <= today;

      // Calculate days until due
      const nextDueDate = new Date(item.nextDueDate);
      const todayDate = new Date(today);
      const diffTime = nextDueDate - todayDate;
      const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...item,
        isDue,
        daysUntilDue,
        categoryName: category?.name || 'Unknown',
        categoryIcon: category?.icon || 'Tag',
        categoryColor: category?.color || 'gray',
        paymentMethodName: paymentMethod?.name || 'Unknown',
        paymentMethodIcon: paymentMethod?.icon || 'Wallet',
      };
    });
  }, [recurring, categories, paymentMethods]);

  // Active recurring
  const activeRecurring = useMemo(() => {
    return recurringWithInfo.filter(r => r.isActive);
  }, [recurringWithInfo]);

  // Due items
  const dueItems = useMemo(() => {
    return recurringWithInfo.filter(r => r.isDue);
  }, [recurringWithInfo]);

  // Upcoming items (due in next 7 days)
  const upcomingItems = useMemo(() => {
    return recurringWithInfo.filter(r => r.isActive && r.daysUntilDue > 0 && r.daysUntilDue <= 7);
  }, [recurringWithInfo]);

  return {
    // State
    recurring: recurringWithInfo,
    activeRecurring,
    dueItems,
    upcomingItems,
    loading,
    error,

    // Actions
    addRecurring,
    updateRecurring,
    deleteRecurring,
    toggleActive,
    processDueTransactions,
    getById,
  };
}

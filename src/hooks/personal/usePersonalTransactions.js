import { useState, useEffect, useCallback, useMemo } from 'react';
import { personalTransactionService } from '../../services/personal';

/**
 * Custom hook for managing personal transactions
 */
export function usePersonalTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to real-time updates
  useEffect(() => {
    setLoading(true);
    const unsubscribe = personalTransactionService.subscribe((data) => {
      setTransactions(data);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  // Add transaction
  const addTransaction = useCallback(async (data) => {
    try {
      const result = await personalTransactionService.add(data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Update transaction
  const updateTransaction = useCallback(async (id, data) => {
    try {
      const result = await personalTransactionService.update(id, data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Delete transaction
  const deleteTransaction = useCallback(async (id) => {
    try {
      await personalTransactionService.delete(id);
      return id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Get transaction by ID
  const getById = useCallback((id) => {
    return transactions.find(t => t.id === id) || null;
  }, [transactions]);

  // Filter transactions by type
  const filterByType = useCallback((type) => {
    return transactions.filter(t => t.type === type);
  }, [transactions]);

  // Filter transactions by date range
  const filterByDateRange = useCallback((startDate, endDate) => {
    return transactions.filter(t => {
      const date = t.date;
      return date >= startDate && date <= endDate;
    });
  }, [transactions]);

  // Filter transactions by category
  const filterByCategory = useCallback((categoryId) => {
    return transactions.filter(t => t.categoryId === categoryId);
  }, [transactions]);

  // Get expenses only
  const expenses = useMemo(() => {
    return transactions.filter(t => t.type === 'expense');
  }, [transactions]);

  // Get income only
  const income = useMemo(() => {
    return transactions.filter(t => t.type === 'income');
  }, [transactions]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalIncome = income.reduce((sum, t) => sum + (t.amount || 0), 0);
    const netBalance = totalIncome - totalExpenses;

    return {
      totalExpenses,
      totalIncome,
      netBalance
    };
  }, [expenses, income]);

  // Get transactions for current month
  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    return transactions.filter(t => t.date >= startOfMonth && t.date <= endOfMonth);
  }, [transactions]);

  // Calculate category totals
  const getCategoryTotals = useCallback((type = null, startDate = null, endDate = null) => {
    let filtered = transactions;

    if (type) {
      filtered = filtered.filter(t => t.type === type);
    }

    if (startDate && endDate) {
      filtered = filtered.filter(t => t.date >= startDate && t.date <= endDate);
    }

    const categoryTotals = {};
    filtered.forEach(t => {
      const catId = t.categoryId || 'uncategorized';
      if (!categoryTotals[catId]) {
        categoryTotals[catId] = 0;
      }
      categoryTotals[catId] += t.amount || 0;
    });

    return categoryTotals;
  }, [transactions]);

  return {
    // State
    transactions,
    loading,
    error,
    expenses,
    income,
    totals,
    currentMonthTransactions,

    // Actions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getById,

    // Filters
    filterByType,
    filterByDateRange,
    filterByCategory,
    getCategoryTotals,
  };
}

import { useState, useEffect, useCallback, useMemo } from 'react';
import { personalBudgetService } from '../../services/personal';

/**
 * Custom hook for managing personal budgets
 */
export function usePersonalBudgets(transactions = [], categories = []) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to real-time updates
  useEffect(() => {
    setLoading(true);
    const unsubscribe = personalBudgetService.subscribe((data) => {
      setBudgets(data);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  // Add budget
  const addBudget = useCallback(async (data) => {
    try {
      const result = await personalBudgetService.add(data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Update budget
  const updateBudget = useCallback(async (id, data) => {
    try {
      const result = await personalBudgetService.update(id, data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Delete budget
  const deleteBudget = useCallback(async (id) => {
    try {
      await personalBudgetService.delete(id);
      return id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Get budget by ID
  const getById = useCallback((id) => {
    return budgets.find(b => b.id === id) || null;
  }, [budgets]);

  // Calculate spent amount for a budget based on current period
  const calculateSpent = useCallback((budget) => {
    if (!budget || !transactions.length) return 0;

    const now = new Date();
    let startDate, endDate;

    if (budget.period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (budget.period === 'weekly') {
      const dayOfWeek = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - dayOfWeek);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      startDate = start.toISOString().split('T')[0];
      endDate = end.toISOString().split('T')[0];
    } else {
      // Default to monthly
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    }

    return transactions
      .filter(t =>
        t.type === 'expense' &&
        t.categoryId === budget.categoryId &&
        t.date >= startDate &&
        t.date <= endDate
      )
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [transactions]);

  // Get budgets with spending info
  const budgetsWithSpending = useMemo(() => {
    return budgets.map(budget => {
      const spent = calculateSpent(budget);
      const remaining = budget.amount - spent;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const category = categories.find(c => c.id === budget.categoryId);

      return {
        ...budget,
        spent,
        remaining,
        percentage: Math.min(percentage, 100),
        isOverBudget: spent > budget.amount,
        categoryName: category?.name || 'Unknown',
        categoryIcon: category?.icon || 'Tag',
        categoryColor: category?.color || 'gray',
      };
    });
  }, [budgets, categories, calculateSpent]);

  // Get active budgets only
  const activeBudgets = useMemo(() => {
    return budgetsWithSpending.filter(b => b.isActive !== false);
  }, [budgetsWithSpending]);

  // Get overbudget items
  const overBudgetItems = useMemo(() => {
    return budgetsWithSpending.filter(b => b.isOverBudget);
  }, [budgetsWithSpending]);

  return {
    // State
    budgets: budgetsWithSpending,
    activeBudgets,
    overBudgetItems,
    loading,
    error,

    // Actions
    addBudget,
    updateBudget,
    deleteBudget,
    getById,
    calculateSpent,
  };
}

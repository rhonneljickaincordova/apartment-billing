import { useState, useEffect, useCallback, useMemo } from 'react';
import { personalGoalService } from '../../services/personal';

/**
 * Custom hook for managing savings goals
 */
export function usePersonalGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to real-time updates
  useEffect(() => {
    setLoading(true);
    const unsubscribe = personalGoalService.subscribe((data) => {
      setGoals(data);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  // Add goal
  const addGoal = useCallback(async (data) => {
    try {
      const result = await personalGoalService.add(data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Update goal
  const updateGoal = useCallback(async (id, data) => {
    try {
      const result = await personalGoalService.update(id, data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Add funds to goal
  const addFunds = useCallback(async (id, amount) => {
    try {
      const goal = goals.find(g => g.id === id);
      if (!goal) throw new Error('Goal not found');

      const newAmount = (goal.currentAmount || 0) + amount;
      const result = await personalGoalService.update(id, {
        ...goal,
        currentAmount: newAmount,
        isCompleted: newAmount >= goal.targetAmount
      });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [goals]);

  // Withdraw funds from goal
  const withdrawFunds = useCallback(async (id, amount) => {
    try {
      const goal = goals.find(g => g.id === id);
      if (!goal) throw new Error('Goal not found');

      const newAmount = Math.max(0, (goal.currentAmount || 0) - amount);
      const result = await personalGoalService.update(id, {
        ...goal,
        currentAmount: newAmount,
        isCompleted: false
      });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [goals]);

  // Delete goal
  const deleteGoal = useCallback(async (id) => {
    try {
      await personalGoalService.delete(id);
      return id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Get goal by ID
  const getById = useCallback((id) => {
    return goals.find(g => g.id === id) || null;
  }, [goals]);

  // Goals with progress info
  const goalsWithProgress = useMemo(() => {
    return goals.map(goal => {
      const progress = goal.targetAmount > 0
        ? (goal.currentAmount / goal.targetAmount) * 100
        : 0;
      const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

      // Calculate days remaining
      let daysRemaining = null;
      if (goal.deadline) {
        const deadlineDate = new Date(goal.deadline);
        const today = new Date();
        const diffTime = deadlineDate - today;
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        ...goal,
        progress: Math.min(progress, 100),
        remaining,
        daysRemaining,
        isOverdue: daysRemaining !== null && daysRemaining < 0 && !goal.isCompleted,
      };
    });
  }, [goals]);

  // Active goals (not completed)
  const activeGoals = useMemo(() => {
    return goalsWithProgress.filter(g => !g.isCompleted);
  }, [goalsWithProgress]);

  // Completed goals
  const completedGoals = useMemo(() => {
    return goalsWithProgress.filter(g => g.isCompleted);
  }, [goalsWithProgress]);

  // Total savings across all goals
  const totalSavings = useMemo(() => {
    return goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  }, [goals]);

  // Total target
  const totalTarget = useMemo(() => {
    return goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  }, [goals]);

  return {
    // State
    goals: goalsWithProgress,
    activeGoals,
    completedGoals,
    totalSavings,
    totalTarget,
    loading,
    error,

    // Actions
    addGoal,
    updateGoal,
    deleteGoal,
    addFunds,
    withdrawFunds,
    getById,
  };
}

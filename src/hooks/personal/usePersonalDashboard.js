import { useMemo } from 'react';

/**
 * Custom hook for dashboard aggregations and summaries
 */
export function usePersonalDashboard(transactions = [], categories = [], budgets = [], goals = []) {
  // Current month date range
  const currentMonthRange = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    return { startOfMonth, endOfMonth };
  }, []);

  // Current month transactions
  const currentMonthTransactions = useMemo(() => {
    const { startOfMonth, endOfMonth } = currentMonthRange;
    return transactions.filter(t => t.date >= startOfMonth && t.date <= endOfMonth);
  }, [transactions, currentMonthRange]);

  // Monthly summary
  const monthlySummary = useMemo(() => {
    const expenses = currentMonthTransactions.filter(t => t.type === 'expense');
    const income = currentMonthTransactions.filter(t => t.type === 'income');

    const totalExpenses = expenses.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalIncome = income.reduce((sum, t) => sum + (t.amount || 0), 0);
    const netBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    return {
      totalExpenses,
      totalIncome,
      netBalance,
      savingsRate: Math.max(0, savingsRate),
      transactionCount: currentMonthTransactions.length,
      expenseCount: expenses.length,
      incomeCount: income.length,
    };
  }, [currentMonthTransactions]);

  // Category breakdown for current month (expenses)
  const categoryBreakdown = useMemo(() => {
    const expenses = currentMonthTransactions.filter(t => t.type === 'expense');

    const breakdown = {};
    expenses.forEach(t => {
      const catId = t.categoryId || 'uncategorized';
      if (!breakdown[catId]) {
        const category = categories.find(c => c.id === catId);
        breakdown[catId] = {
          categoryId: catId,
          name: category?.name || 'Uncategorized',
          icon: category?.icon || 'Tag',
          color: category?.color || 'gray',
          amount: 0,
          count: 0,
        };
      }
      breakdown[catId].amount += t.amount || 0;
      breakdown[catId].count += 1;
    });

    // Convert to array and sort by amount
    const sorted = Object.values(breakdown).sort((a, b) => b.amount - a.amount);

    // Calculate percentages
    const total = sorted.reduce((sum, cat) => sum + cat.amount, 0);
    return sorted.map(cat => ({
      ...cat,
      percentage: total > 0 ? (cat.amount / total) * 100 : 0,
    }));
  }, [currentMonthTransactions, categories]);

  // Income breakdown for current month
  const incomeBreakdown = useMemo(() => {
    const income = currentMonthTransactions.filter(t => t.type === 'income');

    const breakdown = {};
    income.forEach(t => {
      const catId = t.categoryId || 'uncategorized';
      if (!breakdown[catId]) {
        const category = categories.find(c => c.id === catId);
        breakdown[catId] = {
          categoryId: catId,
          name: category?.name || 'Uncategorized',
          icon: category?.icon || 'Tag',
          color: category?.color || 'gray',
          amount: 0,
          count: 0,
        };
      }
      breakdown[catId].amount += t.amount || 0;
      breakdown[catId].count += 1;
    });

    const sorted = Object.values(breakdown).sort((a, b) => b.amount - a.amount);
    const total = sorted.reduce((sum, cat) => sum + cat.amount, 0);
    return sorted.map(cat => ({
      ...cat,
      percentage: total > 0 ? (cat.amount / total) * 100 : 0,
    }));
  }, [currentMonthTransactions, categories]);

  // Recent transactions (last 10)
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
      .map(t => {
        const category = categories.find(c => c.id === t.categoryId);
        return {
          ...t,
          categoryName: category?.name || 'Uncategorized',
          categoryIcon: category?.icon || 'Tag',
          categoryColor: category?.color || 'gray',
        };
      });
  }, [transactions, categories]);

  // Monthly trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = date.toISOString().split('T')[0];
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

      const monthTransactions = transactions.filter(t => t.date >= startOfMonth && t.date <= endOfMonth);
      const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
      const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);

      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        expenses,
        income,
        net: income - expenses,
      });
    }

    return months;
  }, [transactions]);

  // Budget summary
  const budgetSummary = useMemo(() => {
    const activeBudgets = budgets.filter(b => b.isActive !== false);
    const totalBudgeted = activeBudgets.reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalSpent = activeBudgets.reduce((sum, b) => sum + (b.spent || 0), 0);
    const overBudgetCount = activeBudgets.filter(b => b.isOverBudget).length;

    return {
      totalBudgeted,
      totalSpent,
      remaining: totalBudgeted - totalSpent,
      overBudgetCount,
      budgetCount: activeBudgets.length,
      percentUsed: totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0,
    };
  }, [budgets]);

  // Goals summary
  const goalsSummary = useMemo(() => {
    const activeGoals = goals.filter(g => !g.isCompleted);
    const completedGoals = goals.filter(g => g.isCompleted);
    const totalTarget = activeGoals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
    const totalSaved = activeGoals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);

    return {
      activeCount: activeGoals.length,
      completedCount: completedGoals.length,
      totalTarget,
      totalSaved,
      remaining: totalTarget - totalSaved,
      overallProgress: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0,
    };
  }, [goals]);

  // Daily average spending (current month)
  const dailyAverageSpending = useMemo(() => {
    const { startOfMonth } = currentMonthRange;
    const today = new Date();
    const startDate = new Date(startOfMonth);
    const daysPassed = Math.max(1, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));

    return monthlySummary.totalExpenses / daysPassed;
  }, [monthlySummary.totalExpenses, currentMonthRange]);

  // Projected monthly spending
  const projectedMonthlySpending = useMemo(() => {
    const { startOfMonth, endOfMonth } = currentMonthRange;
    const startDate = new Date(startOfMonth);
    const endDate = new Date(endOfMonth);
    const totalDaysInMonth = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    return dailyAverageSpending * totalDaysInMonth;
  }, [dailyAverageSpending, currentMonthRange]);

  return {
    // Date ranges
    currentMonthRange,

    // Summaries
    monthlySummary,
    budgetSummary,
    goalsSummary,

    // Breakdowns
    categoryBreakdown,
    incomeBreakdown,

    // Trends
    monthlyTrend,
    recentTransactions,

    // Projections
    dailyAverageSpending,
    projectedMonthlySpending,
  };
}

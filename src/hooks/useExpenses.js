import { useState, useCallback } from 'react';
import { getToday } from '../utils/dateHelpers';
import { expensesService } from '../services/firestore';
import { useFirestoreCollection } from './useFirestore';

// Expense categories
export const EXPENSE_CATEGORIES = [
  { value: 'mortgage', label: 'Mortgage (Pag-ibig)' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'water', label: 'Water Bill' },
  { value: 'internet', label: 'Internet' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'repairs', label: 'Repairs' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'taxes', label: 'Taxes' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' },
];

// Expense types (personal vs apartment)
export const EXPENSE_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'personal', label: 'Personal' },
];

// Recurring frequency options
export const RECURRING_OPTIONS = [
  { value: 'none', label: 'One-time' },
  { value: 'biweekly', label: 'Every 15 Days' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

/**
 * Validate expense form data
 * @param {object} form - Expense form data
 * @returns {{ isValid: boolean, errors: object }}
 */
const validateExpense = (form) => {
  const errors = {};

  if (!form.category) {
    errors.category = 'Category is required';
  }

  if (!form.description || form.description.trim() === '') {
    errors.description = 'Description is required';
  }

  if (!form.amount || form.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (!form.date) {
    errors.date = 'Date is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Custom hook for managing expenses
 * Handles CRUD operations with validation and Firestore persistence
 */
export function useExpenses() {
  const {
    data: expenses,
    loading,
    error: storageError,
    add,
    update,
    remove,
  } = useFirestoreCollection(expensesService, []);

  const [expenseForm, setExpenseForm] = useState({
    id: null,
    category: '',
    description: '',
    amount: 0,
    date: getToday(),
    notes: '',
    recurringFrequency: 'none',
    expenseType: 'apartment',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * Save expense (create or update)
   * @returns {{ success: boolean, message: string }}
   */
  const saveExpense = useCallback(async () => {
    const validation = validateExpense(expenseForm);
    setErrors(validation.errors);

    if (!validation.isValid) {
      return { success: false, message: 'Please fix the errors before saving.' };
    }

    try {
      const expenseData = {
        category: expenseForm.category,
        description: expenseForm.description.trim(),
        amount: parseFloat(expenseForm.amount),
        date: expenseForm.date,
        notes: expenseForm.notes?.trim() || '',
        recurringFrequency: expenseForm.recurringFrequency || 'none',
        expenseType: expenseForm.expenseType || 'apartment',
      };

      let message;

      if (isEditing) {
        await update(expenseForm.id, expenseData);
        message = 'Expense updated successfully!';
      } else {
        await add(expenseData);
        message = 'Expense created successfully!';
      }

      resetForm();
      return { success: true, message };
    } catch (error) {
      console.error('Error saving expense:', error);
      return { success: false, message: 'Failed to save expense. Please try again.' };
    }
  }, [expenseForm, isEditing, add, update]);

  /**
   * Start editing an expense
   * @param {object} expense - Expense to edit
   */
  const editExpense = useCallback((expense) => {
    setExpenseForm(expense);
    setIsEditing(true);
    setErrors({});
  }, []);

  /**
   * Duplicate an expense (copy all data except id, with today's date)
   * @param {object} expense - Expense to duplicate
   */
  const duplicateExpense = useCallback((expense) => {
    setExpenseForm({
      id: null,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      date: getToday(), // Default to today, user can adjust
      notes: expense.notes || '',
      recurringFrequency: expense.recurringFrequency || 'none',
      expenseType: expense.expenseType || 'apartment',
    });
    setIsEditing(false); // It's a new expense
    setErrors({});
  }, []);

  /**
   * Delete an expense by ID
   * @param {string} id - Expense ID to delete
   * @returns {{ success: boolean, message: string }}
   */
  const deleteExpense = useCallback(
    async (id) => {
      try {
        await remove(id);
        return { success: true, message: 'Expense deleted successfully!' };
      } catch (error) {
        console.error('Error deleting expense:', error);
        return { success: false, message: 'Failed to delete expense.' };
      }
    },
    [remove]
  );

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setExpenseForm({
      id: null,
      category: '',
      description: '',
      amount: 0,
      date: getToday(),
      notes: '',
      recurringFrequency: 'none',
      expenseType: 'apartment',
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
    setExpenseForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (prev[field]) {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  /**
   * Get an expense by ID
   * @param {string} id - Expense ID
   * @returns {object|undefined}
   */
  const getExpenseById = useCallback(
    (id) => {
      return expenses.find((e) => e.id === id);
    },
    [expenses]
  );

  /**
   * Get expenses by category
   * @param {string} category - Category name
   * @returns {array}
   */
  const getExpensesByCategory = useCallback(
    (category) => {
      return expenses.filter((e) => e.category === category);
    },
    [expenses]
  );

  /**
   * Get expenses by type (personal or apartment)
   * @param {string} type - Expense type
   * @returns {array}
   */
  const getExpensesByType = useCallback(
    (type) => {
      return expenses.filter((e) => (e.expenseType || 'apartment') === type);
    },
    [expenses]
  );

  /**
   * Get total expenses by type
   * @param {string} type - Expense type
   * @returns {number}
   */
  const getTotalByType = useCallback(
    (type) => {
      return getExpensesByType(type).reduce((sum, e) => sum + (e.amount || 0), 0);
    },
    [getExpensesByType]
  );

  /**
   * Get expenses by date range
   * @param {string} fromDate - Start date
   * @param {string} toDate - End date
   * @returns {array}
   */
  const getExpensesByDateRange = useCallback(
    (fromDate, toDate) => {
      return expenses.filter((e) => {
        if (fromDate && e.date < fromDate) return false;
        if (toDate && e.date > toDate) return false;
        return true;
      });
    },
    [expenses]
  );

  /**
   * Calculate total expenses
   * @returns {number}
   */
  const getTotalExpenses = useCallback(() => {
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  /**
   * Calculate total expenses by category
   * @param {string} category - Category name
   * @returns {number}
   */
  const getTotalByCategory = useCallback(
    (category) => {
      return getExpensesByCategory(category).reduce((sum, e) => sum + (e.amount || 0), 0);
    },
    [getExpensesByCategory]
  );

  /**
   * Get monthly expenses summary
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {array}
   */
  const getMonthlyExpenses = useCallback(
    (year, month) => {
      const monthStr = String(month).padStart(2, '0');
      const prefix = `${year}-${monthStr}`;
      return expenses.filter((e) => e.date?.startsWith(prefix));
    },
    [expenses]
  );

  return {
    // State
    expenses,
    expenseForm,
    isEditing,
    errors,
    storageError,
    loading,

    // Actions
    saveExpense,
    editExpense,
    duplicateExpense,
    deleteExpense,
    resetForm,
    updateFormField,

    // Helpers
    getExpenseById,
    getExpensesByCategory,
    getExpensesByType,
    getExpensesByDateRange,
    getTotalExpenses,
    getTotalByCategory,
    getTotalByType,
    getMonthlyExpenses,
  };
}

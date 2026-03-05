import { useState, useEffect, useCallback, useMemo } from 'react';
import { personalCategoryService } from '../../services/personal';

/**
 * Custom hook for managing personal categories
 */
export function usePersonalCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Subscribe to real-time updates and initialize defaults
  useEffect(() => {
    setLoading(true);
    let unsubscribe = () => {};

    const init = async () => {
      // First, clean up any duplicates
      await personalCategoryService.removeDuplicates();
      // Then initialize defaults if collection is empty
      await personalCategoryService.initializeDefaults();
      // Add any new default categories that were added after initial setup
      await personalCategoryService.addMissingDefault('Car');
      await personalCategoryService.addMissingDefault('Credit Card');
      setInitialized(true);
    };

    if (!initialized) {
      init();
    }

    unsubscribe = personalCategoryService.subscribe((data) => {
      setCategories(data);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [initialized]);

  // Add category
  const addCategory = useCallback(async (data) => {
    try {
      const result = await personalCategoryService.add(data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Update category
  const updateCategory = useCallback(async (id, data) => {
    try {
      const result = await personalCategoryService.update(id, data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Delete category
  const deleteCategory = useCallback(async (id) => {
    try {
      await personalCategoryService.delete(id);
      return id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Get category by ID
  const getById = useCallback((id) => {
    return categories.find(c => c.id === id) || null;
  }, [categories]);

  // Get expense categories
  const expenseCategories = useMemo(() => {
    return categories.filter(c => c.type === 'expense');
  }, [categories]);

  // Get income categories
  const incomeCategories = useMemo(() => {
    return categories.filter(c => c.type === 'income');
  }, [categories]);

  // Get category options for select
  const getCategoryOptions = useCallback((type = null) => {
    let filtered = categories;
    if (type) {
      filtered = filtered.filter(c => c.type === type);
    }
    return filtered.map(c => ({
      value: c.id,
      label: c.name,
      icon: c.icon,
      color: c.color
    }));
  }, [categories]);

  return {
    // State
    categories,
    loading,
    error,
    expenseCategories,
    incomeCategories,

    // Actions
    addCategory,
    updateCategory,
    deleteCategory,
    getById,
    getCategoryOptions,
  };
}

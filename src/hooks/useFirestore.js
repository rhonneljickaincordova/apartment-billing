import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for Firestore collection with real-time updates
 * @param {Object} service - Firestore service instance
 * @param {*} initialValue - Initial value before data loads
 * @returns {Object} - State and CRUD operations
 */
export function useFirestoreCollection(service, initialValue = []) {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to real-time updates
  useEffect(() => {
    setLoading(true);
    const unsubscribe = service.subscribe((newData) => {
      setData(newData);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [service]);

  // Add item
  const add = useCallback(async (item) => {
    try {
      const newItem = await service.add(item);
      return newItem;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [service]);

  // Update item
  const update = useCallback(async (id, updates) => {
    try {
      const updatedItem = await service.update(id, updates);
      return updatedItem;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [service]);

  // Delete item
  const remove = useCallback(async (id) => {
    try {
      await service.delete(id);
      return id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [service]);

  // Get item by ID
  const getById = useCallback((id) => {
    return data.find(item => item.id === id) || null;
  }, [data]);

  return {
    data,
    loading,
    error,
    add,
    update,
    remove,
    getById,
    setData
  };
}

/**
 * Custom hook for Firestore single document (like settings)
 * @param {Object} service - Firestore settings service
 * @param {*} initialValue - Initial value before data loads
 * @returns {Object} - State and save operation
 */
export function useFirestoreDocument(service, initialValue = {}) {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to real-time updates
  useEffect(() => {
    setLoading(true);
    const unsubscribe = service.subscribe((newData) => {
      if (newData) {
        setData(newData);
      }
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [service]);

  // Save/update document
  const save = useCallback(async (newData) => {
    try {
      await service.save(newData);
      return newData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [service]);

  // Update a single field
  const updateField = useCallback((field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    data,
    loading,
    error,
    save,
    updateField,
    setData
  };
}

export default { useFirestoreCollection, useFirestoreDocument };

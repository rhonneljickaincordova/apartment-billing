import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * Includes error handling for quota exceeded and parsing errors
 *
 * @param {string} key - The localStorage key
 * @param {any} initialValue - Default value if key doesn't exist
 * @returns {[any, function, string|null]} - [storedValue, setValue, error]
 */
export function useLocalStorage(key, initialValue) {
  const [error, setError] = useState(null);

  // Get initial value from localStorage or use default
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      return JSON.parse(item);
    } catch (err) {
      console.error(`Error reading localStorage key "${key}":`, err);
      setError(`Failed to load data for ${key}`);
      return initialValue;
    }
  });

  // Update localStorage when value changes
  const setValue = useCallback((value) => {
    try {
      setError(null);
      // Allow value to be a function for same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      console.error(`Error setting localStorage key "${key}":`, err);

      // Check for quota exceeded
      if (err.name === 'QuotaExceededError' || err.code === 22) {
        setError('Storage quota exceeded. Please delete some data.');
      } else {
        setError(`Failed to save data: ${err.message}`);
      }
    }
  }, [key, storedValue]);

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (err) {
          console.error(`Error parsing storage change for "${key}":`, err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, error];
}

/**
 * Helper to check if localStorage is available
 * @returns {boolean}
 */
export function isLocalStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

export default useLocalStorage;

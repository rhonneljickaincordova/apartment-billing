import { useState, useCallback } from 'react';
import { validateCleaningSchedule } from '../utils/validation';
import { getToday, getNextCleaningDate, isOverdue, isDueSoon } from '../utils/dateHelpers';
import { airconCleaningService } from '../services/firestore';
import { useFirestoreCollection } from './useFirestore';

/**
 * Custom hook for managing aircon cleaning schedules
 * Handles CRUD operations with validation and Firestore persistence
 */
export function useAirconCleaning(rooms) {
  const {
    data: cleaningSchedules,
    loading,
    error: storageError,
    add,
    update,
    remove
  } = useFirestoreCollection(airconCleaningService, []);

  const [cleaningForm, setCleaningForm] = useState({
    id: null,
    roomId: '',
    cleaningInterval: 3,
    lastCleaned: getToday(),
    nextDue: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedHistory, setSelectedHistory] = useState(null);

  /**
   * Save cleaning schedule (create or update)
   * @returns {{ success: boolean, message: string }}
   */
  const saveSchedule = useCallback(async () => {
    const validation = validateCleaningSchedule(cleaningForm, cleaningSchedules, isEditing);
    setErrors(validation.errors);

    if (!validation.isValid) {
      return { success: false, message: 'Please fix the errors before saving.' };
    }

    try {
      const scheduleData = {
        roomId: cleaningForm.roomId,
        cleaningInterval: cleaningForm.cleaningInterval,
        lastCleaned: cleaningForm.lastCleaned,
        nextDue:
          cleaningForm.nextDue ||
          getNextCleaningDate(new Date(cleaningForm.lastCleaned), cleaningForm.cleaningInterval),
        history: cleaningForm.history || [],
      };

      let message;

      if (isEditing) {
        await update(cleaningForm.id, scheduleData);
        message = 'Schedule updated successfully!';
      } else {
        await add(scheduleData);
        message = 'Schedule added successfully!';
      }

      resetForm();
      return { success: true, message };
    } catch (error) {
      console.error('Error saving cleaning schedule:', error);
      return { success: false, message: 'Failed to save schedule. Please try again.' };
    }
  }, [cleaningForm, cleaningSchedules, isEditing, add, update]);

  /**
   * Start editing a schedule
   * @param {object} schedule - Schedule to edit
   */
  const editSchedule = useCallback((schedule) => {
    setCleaningForm(schedule);
    setIsEditing(true);
    setErrors({});
  }, []);

  /**
   * Delete a schedule by ID
   * @param {string} id - Schedule ID to delete
   * @returns {{ success: boolean, message: string }}
   */
  const deleteSchedule = useCallback(
    async (id) => {
      try {
        await remove(id);
        return { success: true, message: 'Schedule deleted successfully!' };
      } catch (error) {
        console.error('Error deleting cleaning schedule:', error);
        return { success: false, message: 'Failed to delete schedule.' };
      }
    },
    [remove]
  );

  /**
   * Delete all schedules for a specific room
   * @param {string} roomId - Room ID
   */
  const deleteSchedulesByRoomId = useCallback(
    async (roomId) => {
      const schedulesToDelete = cleaningSchedules.filter((c) => c.roomId === roomId);
      for (const schedule of schedulesToDelete) {
        await remove(schedule.id);
      }
    },
    [cleaningSchedules, remove]
  );

  /**
   * Mark aircon as cleaned
   * @param {string} roomId - Room ID
   * @returns {{ success: boolean, message: string }}
   */
  const markAsCleaned = useCallback(
    async (roomId) => {
      try {
        const today = getToday();
        const cleaning = cleaningSchedules.find((c) => c.roomId === roomId);

        if (!cleaning) {
          return { success: false, message: 'Cleaning schedule not found.' };
        }

        const historyEntry = {
          id: Date.now().toString(),
          cleanedDate: today,
          previousDueDate: cleaning.nextDue || today,
        };

        await update(cleaning.id, {
          lastCleaned: today,
          nextDue: getNextCleaningDate(new Date(), cleaning.cleaningInterval),
          history: [...(cleaning.history || []), historyEntry],
        });

        return { success: true, message: 'Aircon cleaning marked as completed!' };
      } catch (error) {
        console.error('Error updating cleaning:', error);
        return { success: false, message: 'Failed to update cleaning status.' };
      }
    },
    [cleaningSchedules, update]
  );

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setCleaningForm({
      id: null,
      roomId: '',
      cleaningInterval: 3,
      lastCleaned: getToday(),
      nextDue: '',
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
    setCleaningForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for the field being updated
    setErrors((prev) => {
      if (prev[field]) {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  /**
   * Open history modal for a schedule
   * @param {object} schedule - Schedule to view history
   */
  const openHistory = useCallback((schedule) => {
    setSelectedHistory(schedule);
  }, []);

  /**
   * Close history modal
   */
  const closeHistory = useCallback(() => {
    setSelectedHistory(null);
  }, []);

  /**
   * Get a schedule by ID
   * @param {string} id - Schedule ID
   * @returns {object|undefined}
   */
  const getScheduleById = useCallback(
    (id) => {
      return cleaningSchedules.find((c) => c.id === id);
    },
    [cleaningSchedules]
  );

  /**
   * Get schedule for a specific room
   * @param {string} roomId - Room ID
   * @returns {object|undefined}
   */
  const getScheduleByRoomId = useCallback(
    (roomId) => {
      return cleaningSchedules.find((c) => c.roomId === roomId);
    },
    [cleaningSchedules]
  );

  /**
   * Get overdue schedules
   * @returns {array}
   */
  const getOverdueSchedules = useCallback(() => {
    return cleaningSchedules.filter((c) => isOverdue(c.nextDue));
  }, [cleaningSchedules]);

  /**
   * Get schedules due soon
   * @returns {array}
   */
  const getSchedulesDueSoon = useCallback(() => {
    return cleaningSchedules.filter((c) => isDueSoon(c.nextDue));
  }, [cleaningSchedules]);

  /**
   * Get schedules that need attention (overdue or due soon)
   * @returns {array}
   */
  const getSchedulesNeedingAttention = useCallback(() => {
    return cleaningSchedules.filter((c) => isOverdue(c.nextDue) || isDueSoon(c.nextDue));
  }, [cleaningSchedules]);

  /**
   * Check if a schedule is overdue
   * @param {object} schedule - Schedule object
   * @returns {boolean}
   */
  const isScheduleOverdue = useCallback((schedule) => {
    return isOverdue(schedule.nextDue);
  }, []);

  /**
   * Check if a schedule is due soon
   * @param {object} schedule - Schedule object
   * @returns {boolean}
   */
  const isScheduleDueSoon = useCallback((schedule) => {
    return isDueSoon(schedule.nextDue);
  }, []);

  /**
   * Get room name for a schedule
   * @param {string} roomId - Room ID
   * @returns {string}
   */
  const getRoomName = useCallback(
    (roomId) => {
      const room = rooms.find((r) => r.id === roomId);
      return room?.name || 'Unknown Room';
    },
    [rooms]
  );

  return {
    // State
    cleaningSchedules,
    cleaningForm,
    isEditing,
    errors,
    storageError,
    loading,
    selectedHistory,

    // Actions
    saveSchedule,
    editSchedule,
    deleteSchedule,
    deleteSchedulesByRoomId,
    markAsCleaned,
    resetForm,
    updateFormField,
    openHistory,
    closeHistory,

    // Helpers
    getScheduleById,
    getScheduleByRoomId,
    getOverdueSchedules,
    getSchedulesDueSoon,
    getSchedulesNeedingAttention,
    isScheduleOverdue,
    isScheduleDueSoon,
    getRoomName,
  };
}

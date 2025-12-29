import { useState, useCallback } from 'react';
import { validateRoom } from '../utils/validation';
import { roomsService } from '../services/firestore';
import { useFirestoreCollection } from './useFirestore';

/**
 * Custom hook for managing rooms
 * Handles CRUD operations with validation and Firestore persistence
 */
export function useRooms() {
  const {
    data: rooms,
    loading,
    error: storageError,
    add,
    update,
    remove
  } = useFirestoreCollection(roomsService, []);

  const [roomForm, setRoomForm] = useState({
    id: null,
    name: '',
    persons: 2,
    rent: 0,
    status: 'vacant',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * Save room (create or update)
   * @returns {{ success: boolean, message: string }}
   */
  const saveRoom = useCallback(async () => {
    const validation = validateRoom(roomForm, rooms);
    setErrors(validation.errors);

    if (!validation.isValid) {
      return { success: false, message: 'Please fix the errors before saving.' };
    }

    try {
      const roomData = {
        name: roomForm.name.trim(),
        persons: roomForm.persons,
        rent: roomForm.rent,
        status: roomForm.status,
      };

      let message;

      if (isEditing) {
        await update(roomForm.id, roomData);
        message = 'Room updated successfully!';
      } else {
        await add(roomData);
        message = 'Room added successfully!';
      }

      resetForm();
      return { success: true, message };
    } catch (error) {
      console.error('Error saving room:', error);
      return { success: false, message: 'Failed to save room. Please try again.' };
    }
  }, [roomForm, rooms, isEditing, add, update]);

  /**
   * Start editing a room
   * @param {object} room - Room to edit
   */
  const editRoom = useCallback((room) => {
    setRoomForm(room);
    setIsEditing(true);
    setErrors({});
  }, []);

  /**
   * Delete a room by ID
   * @param {string} id - Room ID to delete
   * @param {function} onRelatedDataCleanup - Callback to clean up related data (bills, cleaning schedules)
   * @returns {{ success: boolean, message: string }}
   */
  const deleteRoom = useCallback(
    async (id, onRelatedDataCleanup) => {
      try {
        await remove(id);

        // Call cleanup function if provided
        if (onRelatedDataCleanup) {
          onRelatedDataCleanup(id);
        }

        return { success: true, message: 'Room deleted successfully!' };
      } catch (error) {
        console.error('Error deleting room:', error);
        return { success: false, message: 'Failed to delete room.' };
      }
    },
    [remove]
  );

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setRoomForm({
      id: null,
      name: '',
      persons: 2,
      rent: 0,
      status: 'vacant',
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
    setRoomForm((prev) => ({ ...prev, [field]: value }));
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
   * Get a room by ID
   * @param {string} id - Room ID
   * @returns {object|undefined}
   */
  const getRoomById = useCallback(
    (id) => {
      return rooms.find((r) => r.id === id);
    },
    [rooms]
  );

  /**
   * Toggle room status between occupied and vacant
   * @param {object} room - Room to toggle
   * @returns {{ success: boolean, message: string }}
   */
  const toggleRoomStatus = useCallback(
    async (room) => {
      try {
        const newStatus = room.status === 'occupied' ? 'vacant' : 'occupied';
        await update(room.id, { status: newStatus });
        return {
          success: true,
          message: `Room marked as ${newStatus}!`,
        };
      } catch (error) {
        console.error('Error toggling room status:', error);
        return { success: false, message: 'Failed to update room status.' };
      }
    },
    [update]
  );

  /**
   * Get occupied rooms only
   * @returns {array}
   */
  const getOccupiedRooms = useCallback(() => {
    return rooms.filter((r) => r.status === 'occupied');
  }, [rooms]);

  /**
   * Get vacant rooms only
   * @returns {array}
   */
  const getVacantRooms = useCallback(() => {
    return rooms.filter((r) => r.status === 'vacant');
  }, [rooms]);

  return {
    // State
    rooms,
    roomForm,
    isEditing,
    errors,
    storageError,
    loading,

    // Actions
    saveRoom,
    editRoom,
    deleteRoom,
    resetForm,
    updateFormField,
    toggleRoomStatus,

    // Helpers
    getRoomById,
    getOccupiedRooms,
    getVacantRooms,
  };
}

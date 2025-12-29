/**
 * Validation utility functions for form inputs
 */

/**
 * Validate a room form
 * @param {object} room - Room form data
 * @param {array} existingRooms - Existing rooms for duplicate check
 * @returns {object} - { isValid: boolean, errors: { field: message } }
 */
export function validateRoom(room, existingRooms = []) {
  const errors = {};

  // Name validation
  if (!room.name || room.name.trim() === '') {
    errors.name = 'Room name is required';
  } else if (room.name.trim().length < 2) {
    errors.name = 'Room name must be at least 2 characters';
  } else {
    // Check for duplicates (excluding current room if editing)
    const duplicate = existingRooms.find(
      (r) => r.name.toLowerCase() === room.name.trim().toLowerCase() && r.id !== room.id
    );
    if (duplicate) {
      errors.name = 'A room with this name already exists';
    }
  }

  // Persons validation
  if (room.persons === undefined || room.persons === null || room.persons === '') {
    errors.persons = 'Number of persons is required';
  } else if (!Number.isInteger(Number(room.persons)) || Number(room.persons) < 1) {
    errors.persons = 'Must be a positive whole number';
  }

  // Rent validation
  if (room.rent === undefined || room.rent === null || room.rent === '') {
    errors.rent = 'Rent amount is required';
  } else if (isNaN(Number(room.rent)) || Number(room.rent) < 0) {
    errors.rent = 'Rent must be a non-negative number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate a bill form
 * @param {object} bill - Bill form data
 * @returns {object} - { isValid: boolean, errors: { field: message } }
 */
export function validateBill(bill) {
  const errors = {};

  // Room validation
  if (!bill.roomId) {
    errors.roomId = 'Please select a room';
  }

  // Due date validation
  if (!bill.dueDate) {
    errors.dueDate = 'Due date is required';
  }

  // Last month reading validation
  if (bill.lastMonthReading === undefined || bill.lastMonthReading === null || bill.lastMonthReading === '') {
    errors.lastMonthReading = 'Last month reading is required';
  } else if (isNaN(Number(bill.lastMonthReading)) || Number(bill.lastMonthReading) < 0) {
    errors.lastMonthReading = 'Must be a non-negative number';
  }

  // Current reading validation
  if (bill.currentReading === undefined || bill.currentReading === null || bill.currentReading === '') {
    errors.currentReading = 'Current reading is required';
  } else if (isNaN(Number(bill.currentReading)) || Number(bill.currentReading) < 0) {
    errors.currentReading = 'Must be a non-negative number';
  } else if (Number(bill.currentReading) < Number(bill.lastMonthReading)) {
    errors.currentReading = 'Current reading must be >= last month reading';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate settings form
 * @param {object} settings - Settings form data
 * @returns {object} - { isValid: boolean, errors: { field: message } }
 */
export function validateSettings(settings) {
  const errors = {};

  // Water rate validation
  if (settings.waterRate === undefined || settings.waterRate === null || settings.waterRate === '') {
    errors.waterRate = 'Water rate is required';
  } else if (isNaN(Number(settings.waterRate)) || Number(settings.waterRate) < 0) {
    errors.waterRate = 'Must be a non-negative number';
  }

  // Electricity rate validation
  if (settings.electricityRate === undefined || settings.electricityRate === null || settings.electricityRate === '') {
    errors.electricityRate = 'Electricity rate is required';
  } else if (isNaN(Number(settings.electricityRate)) || Number(settings.electricityRate) < 0) {
    errors.electricityRate = 'Must be a non-negative number';
  }

  // WiFi rate validation
  if (settings.wifiRate === undefined || settings.wifiRate === null || settings.wifiRate === '') {
    errors.wifiRate = 'WiFi rate is required';
  } else if (isNaN(Number(settings.wifiRate)) || Number(settings.wifiRate) < 0) {
    errors.wifiRate = 'Must be a non-negative number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate cleaning schedule form
 * @param {object} schedule - Cleaning schedule form data
 * @param {array} existingSchedules - Existing schedules for duplicate check
 * @returns {object} - { isValid: boolean, errors: { field: message } }
 */
export function validateCleaningSchedule(schedule, existingSchedules = [], isEditing = false) {
  const errors = {};

  // Room validation
  if (!schedule.roomId) {
    errors.roomId = 'Please select a room';
  } else if (!isEditing) {
    // Check for duplicate schedule
    const duplicate = existingSchedules.find((s) => s.roomId === schedule.roomId);
    if (duplicate) {
      errors.roomId = 'This room already has a cleaning schedule';
    }
  }

  // Last cleaned date validation
  if (!schedule.lastCleaned) {
    errors.lastCleaned = 'Last cleaned date is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

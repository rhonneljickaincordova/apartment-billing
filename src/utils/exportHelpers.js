/**
 * Export utility functions for data export
 */

/**
 * Export data to CSV format and trigger download
 * @param {array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {array} columns - Column configuration [{ key, header }]
 */
export function exportToCSV(data, filename, columns) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return false;
  }

  try {
    // Create header row
    const headers = columns.map((col) => col.header);
    const headerRow = headers.join(',');

    // Create data rows
    const rows = data.map((item) => {
      return columns
        .map((col) => {
          let value = item[col.key];

          // Handle nested keys like "room.name"
          if (col.key.includes('.')) {
            const keys = col.key.split('.');
            value = keys.reduce((obj, key) => obj?.[key], item);
          }

          // Format value for CSV
          if (value === null || value === undefined) {
            return '';
          }
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          if (typeof value === 'number') {
            return value.toFixed(2);
          }
          return value;
        })
        .join(',');
    });

    // Combine header and rows
    const csvContent = [headerRow, ...rows].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${getDateStamp()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return false;
  }
}

/**
 * Export all data to JSON format and trigger download
 * @param {object} data - Object containing all data to export
 * @param {string} filename - Name of the file (without extension)
 */
export function exportToJSON(data, filename) {
  if (!data) {
    console.warn('No data to export');
    return false;
  }

  try {
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      data: data,
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${getDateStamp()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    return false;
  }
}

/**
 * Export bills to CSV with room names
 * @param {array} bills - Array of bill objects
 * @param {array} rooms - Array of room objects (to get room names)
 */
export function exportBillsToCSV(bills, rooms) {
  const getRoomName = (roomId) => rooms.find((r) => r.id === roomId)?.name || 'Unknown';

  const enrichedBills = bills.map((bill) => ({
    ...bill,
    roomName: getRoomName(bill.roomId),
    total: (bill.rentBill || 0) + (bill.electricityBill || 0) + (bill.waterBill || 0) + (bill.wifiBill || 0),
    status: bill.paid ? 'Paid' : 'Unpaid',
  }));

  const columns = [
    { key: 'roomName', header: 'Room' },
    { key: 'dueDate', header: 'Due Date' },
    { key: 'rentBill', header: 'Rent' },
    { key: 'electricityBill', header: 'Electricity' },
    { key: 'waterBill', header: 'Water' },
    { key: 'wifiBill', header: 'WiFi' },
    { key: 'total', header: 'Total' },
    { key: 'status', header: 'Status' },
    { key: 'paidDate', header: 'Paid Date' },
  ];

  return exportToCSV(enrichedBills, 'apartment_bills', columns);
}

/**
 * Export all application data to JSON
 * @param {object} allData - Object with rooms, bills, cleaningSchedules, settings
 */
export function exportAllDataToJSON(allData) {
  return exportToJSON(allData, 'apartment_billing_backup');
}

/**
 * Get current date stamp for filenames
 * @returns {string} Date stamp in YYYYMMDD format
 */
function getDateStamp() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Import data from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<object>} Parsed data object
 */
export async function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        // Validate structure
        if (jsonData.data) {
          resolve(jsonData.data);
        } else {
          resolve(jsonData);
        }
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Local Storage Service using IndexedDB
 * Stores media files locally in the browser's IndexedDB
 * This avoids Firebase Storage costs while supporting larger files
 */

const DB_NAME = 'apartment-billing-media';
const DB_VERSION = 1;
const STORE_NAME = 'media';

let dbInstance = null;

/**
 * Open/create the IndexedDB database
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Store media file in IndexedDB
 * @param {string} id - Unique ID for the media
 * @param {Blob|File} file - The file to store
 * @returns {Promise<void>}
 */
async function storeMedia(id, file) {
  // Read the file FIRST, before starting the transaction
  const arrayBuffer = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });

  // Now start the transaction with the data ready
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.put({
      id,
      data: arrayBuffer,
      mimeType: file.type,
      name: file.name,
      size: file.size,
    });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to store media'));
  });
}

/**
 * Get media file from IndexedDB
 * @param {string} id - Media ID
 * @returns {Promise<string|null>} - Data URL or null if not found
 */
async function getMedia(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      const result = request.result;
      if (result) {
        // Convert ArrayBuffer back to data URL
        const blob = new Blob([result.data], { type: result.mimeType });
        const url = URL.createObjectURL(blob);
        resolve(url);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(new Error('Failed to get media'));
  });
}

/**
 * Delete media from IndexedDB
 * @param {string} id - Media ID
 * @returns {Promise<void>}
 */
async function deleteMedia(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to delete media'));
  });
}

/**
 * Upload room media (stores locally in IndexedDB)
 * @param {string} roomId - Room ID
 * @param {File} file - The file to upload
 * @returns {Promise<object>} - Media object with metadata
 */
export async function uploadRoomMedia(roomId, file) {
  const id = `room_${roomId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Store the actual file data in IndexedDB
  await storeMedia(id, file);

  const isVideo = file.type.startsWith('video/');

  return {
    id,
    name: file.name,
    type: isVideo ? 'video' : 'image',
    mimeType: file.type,
    size: file.size,
    localId: id, // Reference to IndexedDB
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Delete room media from local storage
 * @param {object} mediaItem - Media object with localId
 * @returns {Promise<boolean>}
 */
export async function deleteRoomMedia(mediaItem) {
  if (mediaItem.localId) {
    try {
      await deleteMedia(mediaItem.localId);
    } catch (e) {
      console.warn('Could not delete from IndexedDB:', e);
    }
  }
  return true;
}

/**
 * Get the URL for a media item
 * @param {object} mediaItem - Media object
 * @returns {Promise<string|null>} - Blob URL or null
 */
export async function getMediaUrl(mediaItem) {
  // If it has a localId, fetch from IndexedDB
  if (mediaItem.localId) {
    return getMedia(mediaItem.localId);
  }
  // Legacy: if it has data (base64), return that
  if (mediaItem.data) {
    return mediaItem.data;
  }
  // Legacy: if it has url (Firebase Storage), return that
  if (mediaItem.url) {
    return mediaItem.url;
  }
  return null;
}

/**
 * Upload settings media (stores locally in IndexedDB)
 * @param {File} file - The file to upload
 * @returns {Promise<object>} - Media object with metadata
 */
export async function uploadSettingsMedia(file) {
  const id = `settings_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await storeMedia(id, file);

  const isVideo = file.type.startsWith('video/');

  return {
    id,
    name: file.name,
    type: isVideo ? 'video' : 'image',
    mimeType: file.type,
    size: file.size,
    localId: id,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Delete settings media from local storage
 * @param {object} mediaItem - Media object with localId
 * @returns {Promise<boolean>}
 */
export async function deleteSettingsMedia(mediaItem) {
  if (mediaItem.localId) {
    try {
      await deleteMedia(mediaItem.localId);
    } catch (e) {
      console.warn('Could not delete from IndexedDB:', e);
    }
  }
  return true;
}

/**
 * Check if IndexedDB is supported
 * @returns {boolean}
 */
export function isLocalStorageSupported() {
  return typeof indexedDB !== 'undefined';
}

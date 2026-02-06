import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Storage Service
 * Handles file uploads/downloads to Firebase Storage
 */

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - Storage path (e.g., 'rooms/roomId/filename.jpg')
 * @param {function} onProgress - Optional progress callback
 * @returns {Promise<{url: string, path: string}>} - Download URL and storage path
 */
export async function uploadFile(file, path, onProgress) {
  const storageRef = ref(storage, path);

  // Upload the file
  const snapshot = await uploadBytes(storageRef, file);

  // Get the download URL
  const url = await getDownloadURL(snapshot.ref);

  return {
    url,
    path: snapshot.ref.fullPath,
  };
}

/**
 * Delete a file from Firebase Storage
 * @param {string} path - Storage path of the file to delete
 * @returns {Promise<boolean>} - True if deleted successfully
 */
export async function deleteFile(path) {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    // File might not exist, which is fine
    if (error.code === 'storage/object-not-found') {
      console.warn('File not found in storage:', path);
      return true;
    }
    throw error;
  }
}

/**
 * Upload room media (image or video)
 * @param {string} roomId - Room ID
 * @param {File} file - The file to upload
 * @returns {Promise<object>} - Media object with URL and metadata
 */
export async function uploadRoomMedia(roomId, file) {
  const timestamp = Date.now();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `rooms/${roomId}/${timestamp}_${safeFileName}`;

  const { url, path: storagePath } = await uploadFile(file, path);

  const isVideo = file.type.startsWith('video/');

  return {
    id: timestamp + Math.random().toString(36).substr(2, 9),
    name: file.name,
    type: isVideo ? 'video' : 'image',
    mimeType: file.type,
    url, // URL instead of base64 data
    storagePath, // Store path for deletion later
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Delete room media from storage
 * @param {object} mediaItem - Media object with storagePath
 * @returns {Promise<boolean>}
 */
export async function deleteRoomMedia(mediaItem) {
  if (mediaItem.storagePath) {
    return deleteFile(mediaItem.storagePath);
  }
  // Legacy media without storagePath (base64) - nothing to delete from storage
  return true;
}

/**
 * Upload settings media (for general share templates)
 * @param {File} file - The file to upload
 * @returns {Promise<object>} - Media object with URL and metadata
 */
export async function uploadSettingsMedia(file) {
  const timestamp = Date.now();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `settings/media/${timestamp}_${safeFileName}`;

  const { url, path: storagePath } = await uploadFile(file, path);

  const isVideo = file.type.startsWith('video/');

  return {
    id: timestamp + Math.random().toString(36).substr(2, 9),
    name: file.name,
    type: isVideo ? 'video' : 'image',
    mimeType: file.type,
    url,
    storagePath,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Delete settings media from storage
 * @param {object} mediaItem - Media object with storagePath
 * @returns {Promise<boolean>}
 */
export async function deleteSettingsMedia(mediaItem) {
  if (mediaItem.storagePath) {
    return deleteFile(mediaItem.storagePath);
  }
  return true;
}

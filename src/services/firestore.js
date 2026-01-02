import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection names
export const COLLECTIONS = {
  ROOMS: 'rooms',
  BILLS: 'bills',
  AIRCON_CLEANING: 'airconCleaning',
  SETTINGS: 'settings',
  TENANTS: 'tenants'
};

/**
 * Generic Firestore service for CRUD operations
 */
class FirestoreService {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.collectionRef = collection(db, collectionName);
  }

  /**
   * Get all documents from collection
   */
  async getAll(orderByField = 'createdAt') {
    try {
      const q = query(this.collectionRef, orderBy(orderByField, 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error getting ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get a single document by ID
   */
  async getById(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error(`Error getting ${this.collectionName} by ID:`, error);
      throw error;
    }
  }

  /**
   * Add a new document
   */
  async add(data) {
    try {
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(this.collectionRef, docData);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error(`Error adding to ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing document
   */
  async update(id, data) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      // Remove id from update data if present
      delete updateData.id;
      await updateDoc(docRef, updateData);
      return { id, ...data };
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  async delete(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return id;
    } catch (error) {
      console.error(`Error deleting from ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(callback, orderByField = 'createdAt') {
    const q = query(this.collectionRef, orderBy(orderByField, 'desc'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    }, (error) => {
      console.error(`Error in ${this.collectionName} subscription:`, error);
    });
  }
}

// Create service instances for each collection
export const roomsService = new FirestoreService(COLLECTIONS.ROOMS);
export const billsService = new FirestoreService(COLLECTIONS.BILLS);
export const airconCleaningService = new FirestoreService(COLLECTIONS.AIRCON_CLEANING);
export const tenantsService = new FirestoreService(COLLECTIONS.TENANTS);

// Settings service (single document)
export const settingsService = {
  async get() {
    try {
      const docRef = doc(db, COLLECTIONS.SETTINGS, 'default');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting settings:', error);
      throw error;
    }
  },

  async save(data) {
    try {
      const docRef = doc(db, COLLECTIONS.SETTINGS, 'default');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp()
        });
      } else {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(docRef, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      return data;
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  },

  subscribe(callback) {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'default');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      }
    }, (error) => {
      console.error('Error in settings subscription:', error);
    });
  }
};

export default {
  rooms: roomsService,
  bills: billsService,
  airconCleaning: airconCleaningService,
  settings: settingsService,
  tenants: tenantsService
};

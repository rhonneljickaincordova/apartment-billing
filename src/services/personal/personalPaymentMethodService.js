import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS } from './personalTransactionService';

// Default payment methods
export const DEFAULT_PAYMENT_METHODS = [
  { name: 'Cash', type: 'cash', icon: 'Wallet', balance: 0, isDefault: true },
  { name: 'GCash', type: 'ewallet', icon: 'Smartphone', balance: 0, isDefault: true },
  { name: 'Maya', type: 'ewallet', icon: 'CreditCard', balance: 0, isDefault: true },
  { name: 'Bank Transfer', type: 'bank', icon: 'Building', balance: 0, isDefault: true },
  { name: 'Credit Card', type: 'card', icon: 'CreditCard', balance: 0, isDefault: true },
];

/**
 * Personal Payment Method Service
 * Handles CRUD operations for payment methods
 */
class PersonalPaymentMethodService {
  constructor() {
    this.collectionName = COLLECTIONS.PAYMENT_METHODS;
    this.collectionRef = collection(db, this.collectionName);
  }

  /**
   * Initialize default payment methods if none exist
   */
  async initializeDefaults() {
    try {
      const snapshot = await getDocs(this.collectionRef);
      if (snapshot.empty) {
        const promises = DEFAULT_PAYMENT_METHODS.map(method =>
          addDoc(this.collectionRef, {
            ...method,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
        );
        await Promise.all(promises);
        console.log('Default payment methods initialized');
      }
    } catch (error) {
      console.error('Error initializing default payment methods:', error);
    }
  }

  /**
   * Add a new payment method
   * @param {Object} data - Payment method data
   * @param {string} data.name - Name of the payment method
   * @param {string} data.type - 'cash', 'card', 'ewallet', or 'bank'
   * @param {string} data.icon - Icon name
   * @param {number} data.balance - Current balance (optional tracking)
   */
  async add(data) {
    try {
      const docData = {
        name: data.name || '',
        type: data.type || 'cash',
        icon: data.icon || 'Wallet',
        balance: data.balance || 0,
        isDefault: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(this.collectionRef, docData);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  /**
   * Update a payment method
   */
  async update(id, data) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      delete updateData.id;
      await updateDoc(docRef, updateData);
      return { id, ...data };
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  /**
   * Update balance for a payment method
   */
  async updateBalance(id, amount, isAddition = true) {
    try {
      const docRef = doc(db, this.collectionName, id);
      // Note: In a real app, you'd use increment() for atomic operations
      // For now, the balance adjustment will be handled at the hook level
      await updateDoc(docRef, {
        balance: amount,
        updatedAt: serverTimestamp()
      });
      return { id, balance: amount };
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  }

  /**
   * Delete a payment method (only non-default)
   */
  async delete(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return id;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(callback) {
    const q = query(this.collectionRef, orderBy('name', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    }, (error) => {
      console.error('Error in payment methods subscription:', error);
    });
  }

  /**
   * Remove duplicate payment methods (keeps the first occurrence)
   */
  async removeDuplicates() {
    try {
      const snapshot = await getDocs(this.collectionRef);
      const methods = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      // Find duplicates by name
      const seen = new Map();
      const duplicateIds = [];

      methods.forEach(method => {
        const key = method.name.toLowerCase();
        if (seen.has(key)) {
          duplicateIds.push(method.id);
        } else {
          seen.set(key, method.id);
        }
      });

      // Delete duplicates
      if (duplicateIds.length > 0) {
        const deletePromises = duplicateIds.map(id =>
          deleteDoc(doc(db, this.collectionName, id))
        );
        await Promise.all(deletePromises);
        console.log(`Removed ${duplicateIds.length} duplicate payment methods`);
      }

      return duplicateIds.length;
    } catch (error) {
      console.error('Error removing duplicate payment methods:', error);
      throw error;
    }
  }
}

export const personalPaymentMethodService = new PersonalPaymentMethodService();

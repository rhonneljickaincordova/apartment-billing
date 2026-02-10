import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS } from './personalTransactionService';

/**
 * Personal Recurring Transaction Service
 * Handles CRUD operations for recurring transactions
 */
class PersonalRecurringService {
  constructor() {
    this.collectionName = COLLECTIONS.RECURRING;
    this.collectionRef = collection(db, this.collectionName);
  }

  /**
   * Add a new recurring transaction
   * @param {Object} data - Recurring transaction data
   * @param {Object} data.transactionTemplate - Template for the transaction to create
   * @param {string} data.frequency - 'daily', 'weekly', 'monthly', or 'yearly'
   * @param {string} data.nextDueDate - Next date to create the transaction
   * @param {boolean} data.isActive - Whether the recurring is active
   */
  async add(data) {
    try {
      const docData = {
        transactionTemplate: {
          type: data.transactionTemplate?.type || 'expense',
          amount: data.transactionTemplate?.amount || 0,
          categoryId: data.transactionTemplate?.categoryId || '',
          paymentMethodId: data.transactionTemplate?.paymentMethodId || '',
          description: data.transactionTemplate?.description || '',
          tags: data.transactionTemplate?.tags || [],
        },
        frequency: data.frequency || 'monthly',
        nextDueDate: data.nextDueDate || new Date().toISOString().split('T')[0],
        isActive: data.isActive !== false,
        lastProcessedDate: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(this.collectionRef, docData);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error adding recurring transaction:', error);
      throw error;
    }
  }

  /**
   * Update a recurring transaction
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
      console.error('Error updating recurring transaction:', error);
      throw error;
    }
  }

  /**
   * Mark a recurring transaction as processed and update next due date
   */
  async markProcessed(id, nextDueDate) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        lastProcessedDate: new Date().toISOString().split('T')[0],
        nextDueDate: nextDueDate,
        updatedAt: serverTimestamp()
      });
      return { id, nextDueDate };
    } catch (error) {
      console.error('Error marking recurring as processed:', error);
      throw error;
    }
  }

  /**
   * Toggle active state
   */
  async toggleActive(id, isActive) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        isActive: isActive,
        updatedAt: serverTimestamp()
      });
      return { id, isActive };
    } catch (error) {
      console.error('Error toggling recurring active state:', error);
      throw error;
    }
  }

  /**
   * Delete a recurring transaction
   */
  async delete(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return id;
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(callback) {
    const q = query(this.collectionRef, orderBy('nextDueDate', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    }, (error) => {
      console.error('Error in recurring subscription:', error);
    });
  }
}

export const personalRecurringService = new PersonalRecurringService();

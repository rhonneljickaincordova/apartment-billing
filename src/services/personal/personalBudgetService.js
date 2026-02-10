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
 * Personal Budget Service
 * Handles CRUD operations for budget management
 */
class PersonalBudgetService {
  constructor() {
    this.collectionName = COLLECTIONS.BUDGETS;
    this.collectionRef = collection(db, this.collectionName);
  }

  /**
   * Add a new budget
   * @param {Object} data - Budget data
   * @param {string} data.categoryId - Category ID to budget for
   * @param {number} data.amount - Budget amount
   * @param {string} data.period - 'monthly' or 'weekly'
   * @param {string} data.startDate - Start date for the budget
   */
  async add(data) {
    try {
      const docData = {
        categoryId: data.categoryId || '',
        amount: data.amount || 0,
        period: data.period || 'monthly',
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        isActive: data.isActive !== false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(this.collectionRef, docData);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error adding budget:', error);
      throw error;
    }
  }

  /**
   * Update a budget
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
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  /**
   * Delete a budget
   */
  async delete(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return id;
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(callback) {
    const q = query(this.collectionRef, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    }, (error) => {
      console.error('Error in budgets subscription:', error);
    });
  }
}

export const personalBudgetService = new PersonalBudgetService();

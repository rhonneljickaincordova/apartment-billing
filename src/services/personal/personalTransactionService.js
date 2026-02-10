import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';

// Collection names for personal finance module
export const COLLECTIONS = {
  TRANSACTIONS: 'personal_transactions',
  CATEGORIES: 'personal_categories',
  BUDGETS: 'personal_budgets',
  GOALS: 'personal_goals',
  PAYMENT_METHODS: 'personal_payment_methods',
  RECURRING: 'personal_recurring'
};

/**
 * Personal Transaction Service
 * Handles CRUD operations for personal income and expenses
 */
class PersonalTransactionService {
  constructor() {
    this.collectionName = COLLECTIONS.TRANSACTIONS;
    this.collectionRef = collection(db, this.collectionName);
  }

  /**
   * Add a new transaction
   * @param {Object} data - Transaction data
   * @param {string} data.type - 'expense' or 'income'
   * @param {number} data.amount - Transaction amount
   * @param {string} data.categoryId - Category ID
   * @param {string} data.paymentMethodId - Payment method ID
   * @param {string} data.date - Transaction date (YYYY-MM-DD)
   * @param {string} data.description - Description
   * @param {string[]} data.tags - Array of tags
   * @param {string} data.recurringId - Recurring transaction ID (if applicable)
   */
  async add(data) {
    try {
      const docData = {
        type: data.type || 'expense',
        amount: data.amount || 0,
        categoryId: data.categoryId || '',
        paymentMethodId: data.paymentMethodId || '',
        date: data.date || new Date().toISOString().split('T')[0],
        description: data.description || '',
        tags: data.tags || [],
        recurringId: data.recurringId || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(this.collectionRef, docData);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  /**
   * Update an existing transaction
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
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  /**
   * Delete a transaction
   */
  async delete(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return id;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(callback) {
    const q = query(this.collectionRef, orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    }, (error) => {
      console.error('Error in transactions subscription:', error);
    });
  }

  /**
   * Subscribe to transactions within a date range
   */
  subscribeByDateRange(startDate, endDate, callback) {
    const q = query(
      this.collectionRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    }, (error) => {
      console.error('Error in date range subscription:', error);
    });
  }
}

export const personalTransactionService = new PersonalTransactionService();

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
 * Personal Goal Service
 * Handles CRUD operations for savings goals
 */
class PersonalGoalService {
  constructor() {
    this.collectionName = COLLECTIONS.GOALS;
    this.collectionRef = collection(db, this.collectionName);
  }

  /**
   * Add a new savings goal
   * @param {Object} data - Goal data
   * @param {string} data.name - Goal name
   * @param {number} data.targetAmount - Target amount to save
   * @param {number} data.currentAmount - Current saved amount
   * @param {string} data.deadline - Target deadline
   * @param {string} data.icon - Icon name
   * @param {string} data.color - Color for display
   */
  async add(data) {
    try {
      const docData = {
        name: data.name || '',
        targetAmount: data.targetAmount || 0,
        currentAmount: data.currentAmount || 0,
        deadline: data.deadline || null,
        icon: data.icon || 'Target',
        color: data.color || 'blue',
        isCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(this.collectionRef, docData);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  }

  /**
   * Update a goal
   */
  async update(id, data) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      delete updateData.id;

      // Check if goal is completed
      if (updateData.currentAmount >= updateData.targetAmount) {
        updateData.isCompleted = true;
      }

      await updateDoc(docRef, updateData);
      return { id, ...data };
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  }

  /**
   * Add funds to a goal
   */
  async addFunds(id, amount, currentAmount) {
    try {
      const newAmount = (currentAmount || 0) + amount;
      return await this.update(id, { currentAmount: newAmount });
    } catch (error) {
      console.error('Error adding funds to goal:', error);
      throw error;
    }
  }

  /**
   * Delete a goal
   */
  async delete(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return id;
    } catch (error) {
      console.error('Error deleting goal:', error);
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
      console.error('Error in goals subscription:', error);
    });
  }
}

export const personalGoalService = new PersonalGoalService();

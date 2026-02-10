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

// Default categories for personal finance
export const DEFAULT_CATEGORIES = [
  // Expense categories
  { name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: 'orange', isDefault: true },
  { name: 'Groceries', type: 'expense', icon: 'ShoppingCart', color: 'green', isDefault: true },
  { name: 'Transportation', type: 'expense', icon: 'Car', color: 'blue', isDefault: true },
  { name: 'Car', type: 'expense', icon: 'Car', color: 'slate', isDefault: true },
  { name: 'Gas & Fuel', type: 'expense', icon: 'Fuel', color: 'amber', isDefault: true },
  { name: 'Utilities', type: 'expense', icon: 'Zap', color: 'yellow', isDefault: true },
  { name: 'Internet & Phone', type: 'expense', icon: 'Wifi', color: 'cyan', isDefault: true },
  { name: 'Entertainment', type: 'expense', icon: 'Film', color: 'purple', isDefault: true },
  { name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: 'pink', isDefault: true },
  { name: 'Clothing', type: 'expense', icon: 'Shirt', color: 'violet', isDefault: true },
  { name: 'Health & Medical', type: 'expense', icon: 'Heart', color: 'red', isDefault: true },
  { name: 'Pharmacy', type: 'expense', icon: 'Pill', color: 'rose', isDefault: true },
  { name: 'Education', type: 'expense', icon: 'BookOpen', color: 'teal', isDefault: true },
  { name: 'Personal Care', type: 'expense', icon: 'User', color: 'indigo', isDefault: true },
  { name: 'Housing & Rent', type: 'expense', icon: 'Home', color: 'slate', isDefault: true },
  { name: 'Insurance', type: 'expense', icon: 'Shield', color: 'gray', isDefault: true },
  { name: 'Subscriptions', type: 'expense', icon: 'CreditCard', color: 'blue', isDefault: true },
  { name: 'Travel', type: 'expense', icon: 'Plane', color: 'sky', isDefault: true },
  { name: 'Gifts & Donations', type: 'expense', icon: 'Gift', color: 'pink', isDefault: true },
  { name: 'Pets', type: 'expense', icon: 'PawPrint', color: 'amber', isDefault: true },
  { name: 'Kids & Family', type: 'expense', icon: 'Baby', color: 'lime', isDefault: true },
  { name: 'Home Maintenance', type: 'expense', icon: 'Wrench', color: 'stone', isDefault: true },
  { name: 'Fitness & Sports', type: 'expense', icon: 'Dumbbell', color: 'orange', isDefault: true },
  { name: 'Coffee & Drinks', type: 'expense', icon: 'Coffee', color: 'amber', isDefault: true },
  { name: 'Taxes', type: 'expense', icon: 'Receipt', color: 'red', isDefault: true },
  { name: 'Fees & Charges', type: 'expense', icon: 'Banknote', color: 'gray', isDefault: true },
  { name: 'Other Expense', type: 'expense', icon: 'MoreHorizontal', color: 'gray', isDefault: true },
  // Income categories
  { name: 'Salary', type: 'income', icon: 'Briefcase', color: 'green', isDefault: true },
  { name: 'Freelance', type: 'income', icon: 'Laptop', color: 'cyan', isDefault: true },
  { name: 'Investment Returns', type: 'income', icon: 'TrendingUp', color: 'emerald', isDefault: true },
  { name: 'Dividends', type: 'income', icon: 'PieChart', color: 'teal', isDefault: true },
  { name: 'Business Income', type: 'income', icon: 'Building', color: 'blue', isDefault: true },
  { name: 'Rental Income', type: 'income', icon: 'Home', color: 'indigo', isDefault: true },
  { name: 'Bonus', type: 'income', icon: 'Award', color: 'yellow', isDefault: true },
  { name: 'Commission', type: 'income', icon: 'Percent', color: 'orange', isDefault: true },
  { name: 'Refund', type: 'income', icon: 'RotateCcw', color: 'sky', isDefault: true },
  { name: 'Gift Received', type: 'income', icon: 'Gift', color: 'pink', isDefault: true },
  { name: 'Interest', type: 'income', icon: 'Percent', color: 'lime', isDefault: true },
  { name: 'Side Hustle', type: 'income', icon: 'Zap', color: 'purple', isDefault: true },
  { name: 'Other Income', type: 'income', icon: 'Plus', color: 'gray', isDefault: true },
];

/**
 * Personal Category Service
 * Handles CRUD operations for transaction categories
 */
class PersonalCategoryService {
  constructor() {
    this.collectionName = COLLECTIONS.CATEGORIES;
    this.collectionRef = collection(db, this.collectionName);
  }

  /**
   * Initialize default categories if none exist
   * Note: Does NOT add missing defaults to avoid creating duplicates
   */
  async initializeDefaults() {
    try {
      const snapshot = await getDocs(this.collectionRef);

      if (snapshot.empty) {
        // No categories exist, add all defaults
        const promises = DEFAULT_CATEGORIES.map(category =>
          addDoc(this.collectionRef, {
            ...category,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
        );
        await Promise.all(promises);
        console.log('Default categories initialized');
      }
      // Don't add missing defaults here - it can cause duplicates
    } catch (error) {
      console.error('Error initializing default categories:', error);
    }
  }

  /**
   * Add a single missing default category by name
   * Use this to manually add new defaults after initial setup
   */
  async addMissingDefault(categoryName) {
    try {
      const defaultCat = DEFAULT_CATEGORIES.find(c => c.name === categoryName);
      if (!defaultCat) {
        console.log(`Category "${categoryName}" not found in defaults`);
        return null;
      }

      // Check if it already exists
      const snapshot = await getDocs(this.collectionRef);
      const exists = snapshot.docs.some(
        doc => doc.data().name === categoryName && doc.data().type === defaultCat.type
      );

      if (exists) {
        console.log(`Category "${categoryName}" already exists`);
        return null;
      }

      const docRef = await addDoc(this.collectionRef, {
        ...defaultCat,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log(`Added missing default category: ${categoryName}`);
      return { id: docRef.id, ...defaultCat };
    } catch (error) {
      console.error('Error adding missing default:', error);
      throw error;
    }
  }

  /**
   * Add a new category
   */
  async add(data) {
    try {
      const docData = {
        name: data.name || '',
        type: data.type || 'expense',
        icon: data.icon || 'Tag',
        color: data.color || 'gray',
        isDefault: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(this.collectionRef, docData);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }

  /**
   * Update a category
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
      console.error('Error updating category:', error);
      throw error;
    }
  }

  /**
   * Delete a category (only non-default)
   */
  async delete(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return id;
    } catch (error) {
      console.error('Error deleting category:', error);
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
      console.error('Error in categories subscription:', error);
    });
  }

  /**
   * Remove duplicate categories (keeps the first occurrence)
   */
  async removeDuplicates() {
    try {
      const snapshot = await getDocs(this.collectionRef);
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Find duplicates by name and type
      const seen = new Map();
      const duplicateIds = [];

      categories.forEach(cat => {
        const key = `${cat.name}-${cat.type}`;
        if (seen.has(key)) {
          duplicateIds.push(cat.id);
        } else {
          seen.set(key, cat.id);
        }
      });

      // Delete duplicates
      if (duplicateIds.length > 0) {
        const deletePromises = duplicateIds.map(id =>
          deleteDoc(doc(db, this.collectionName, id))
        );
        await Promise.all(deletePromises);
        console.log(`Removed ${duplicateIds.length} duplicate categories`);
      }

      return duplicateIds.length;
    } catch (error) {
      console.error('Error removing duplicates:', error);
      throw error;
    }
  }
}

export const personalCategoryService = new PersonalCategoryService();

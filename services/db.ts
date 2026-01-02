
import { Transaction, Budget, Category } from '../types';

const API_BASE = '/api';
const LOCAL_STORAGE_KEY = 'spendwise_transactions_backup';

// Helper to get local backup
const getLocalBackup = (): Transaction[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Helper to save local backup
const saveLocalBackup = (transactions: Transaction[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
};

export const db = {
  isUsingApi: true,

  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const response = await fetch(`${API_BASE}/transactions`);
      if (!response.ok) throw new Error('Server returned error');
      
      const data = await response.json();
      // Sync local backup with fresh server data
      saveLocalBackup(data);
      db.isUsingApi = true;
      return data;
    } catch (error) {
      console.warn('MySQL API unreachable, falling back to local storage:', error);
      db.isUsingApi = false;
      return getLocalBackup();
    }
  },

  saveTransaction: async (transaction: Transaction): Promise<void> => {
    // Always update local backup first for responsiveness
    const local = getLocalBackup();
    const existingIndex = local.findIndex(t => t.id === transaction.id);
    if (existingIndex > -1) local[existingIndex] = transaction;
    else local.unshift(transaction);
    saveLocalBackup(local);

    try {
      const response = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      if (!response.ok) throw new Error('Failed to save to MySQL');
      db.isUsingApi = true;
    } catch (error) {
      console.error('API Save failed, data saved locally only:', error);
      db.isUsingApi = false;
      // We don't throw here so the UI thinks it succeeded (Local-First pattern)
    }
  },

  deleteTransaction: async (id: string): Promise<void> => {
    // Update local backup
    const local = getLocalBackup().filter(t => t.id !== id);
    saveLocalBackup(local);

    try {
      const response = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete from MySQL');
      db.isUsingApi = true;
    } catch (error) {
      console.error('API Delete failed, removed locally only:', error);
      db.isUsingApi = false;
    }
  },

  getBudgets: (): Budget[] => {
    const data = localStorage.getItem('spendwise_budgets');
    return data ? JSON.parse(data) : [];
  },

  saveBudget: (budget: Budget) => {
    const budgets = db.getBudgets();
    const existingIndex = budgets.findIndex(b => b.category === budget.category);
    if (existingIndex > -1) budgets[existingIndex] = budget;
    else budgets.push(budget);
    localStorage.setItem('spendwise_budgets', JSON.stringify(budgets));
  }
};

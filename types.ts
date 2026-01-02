
export enum Category {
  FOOD = 'Food & Dining',
  TRANSPORT = 'Transport',
  SHOPPING = 'Shopping',
  ENTERTAINMENT = 'Entertainment',
  HEALTH = 'Health',
  BILLS = 'Bills & Utilities',
  INCOME = 'Income',
  OTHER = 'Other'
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: Category;
  type: 'expense' | 'income';
  description?: string;
}

export interface Budget {
  category: Category;
  limit: number;
}

export interface AIInsight {
  summary: string;
  recommendations: string[];
  savingsPotential: string;
}

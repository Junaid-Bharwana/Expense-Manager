
import React, { useState, useEffect } from 'react';
import { Transaction, Category } from '../types';
import { geminiService } from '../services/geminiService';

interface TransactionFormProps {
  onSave: (transaction: Transaction) => void;
  onClose: () => void;
  initialData?: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSave, onClose, initialData }) => {
  const [formData, setFormData] = useState<Partial<Transaction>>(
    initialData || {
      title: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: Category.OTHER,
      type: 'expense',
    }
  );
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleTitleBlur = async () => {
    if (formData.title && !initialData) {
      setIsSuggesting(true);
      const suggested = await geminiService.suggestCategory(formData.title);
      setFormData(prev => ({ ...prev, category: suggested }));
      setIsSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;
    
    onSave({
      ...formData,
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
    } as Transaction);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Edit Transaction' : 'New Transaction'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense' })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                formData.type === 'expense' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income' })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                formData.type === 'income' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'
              }`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onBlur={handleTitleBlur}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Weekly Groceries"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount || ''}
                onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Category {isSuggesting && <span className="text-xs text-indigo-500 italic ml-2">AI thinking...</span>}
            </label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
            >
              {Object.values(Category).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all mt-4"
          >
            {initialData ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;

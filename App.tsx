
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import TransactionForm from './components/TransactionForm.tsx';
import AIInsights from './components/AIInsights.tsx';
import { db } from './services/db.ts';
import { Transaction } from './types.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'insights' | 'settings'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await db.getTransactions();
      setTransactions(data);
      setIsOnline(db.isUsingApi);
    } catch (error) {
      console.error("Critical error loading transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleSaveTransaction = async (transaction: Transaction) => {
    await db.saveTransaction(transaction);
    await loadTransactions();
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      await db.deleteTransaction(id);
      await loadTransactions();
    }
  };

  const openEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setIsFormOpen(true);
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
              {!loading && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isOnline ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {isOnline ? 'MySQL Sync Active' : 'Offline / Demo Mode'}
                </span>
              )}
            </div>
            <p className="text-slate-500 mt-1">
              {activeTab === 'dashboard' && 'Your real-time financial snapshot.'}
              {activeTab === 'transactions' && (isOnline ? 'Syncing securely with your Hostinger database.' : 'Running in local mode. API currently unreachable.')}
              {activeTab === 'insights' && 'Smart financial advice powered by Gemini.'}
            </p>
          </div>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Entry</span>
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-slate-500 animate-pulse">Establishing connection...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard transactions={transactions} />}
            
            {activeTab === 'transactions' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 text-sm text-slate-600">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">{t.title}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                              {t.category}
                            </span>
                          </td>
                          <td className={`px-6 py-4 text-sm font-bold text-right ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEdit(t)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button onClick={() => handleDeleteTransaction(t.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                            {isOnline ? 'No data found in MySQL.' : 'No local data found.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'insights' && <AIInsights transactions={transactions} />}

            {activeTab === 'settings' && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">JS</div>
                <h3 className="text-xl font-bold text-slate-800">John Smith</h3>
                <p className="text-slate-500 mb-6">
                  {isOnline ? 'Connection: MySQL Active' : 'Connection: Local Storage Only'}
                </p>
                <div className="max-w-xs mx-auto space-y-3">
                  <button onClick={loadTransactions} className="w-full py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retry MySQL Sync
                  </button>
                  <button className="w-full py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50">Export (SQL)</button>
                  <button className="w-full py-2.5 text-rose-600 font-medium">Log Out</button>
                </div>

                {!isOnline && (
                  <div className="mt-8 p-4 bg-amber-50 rounded-xl text-left border border-amber-100">
                    <h4 className="font-bold text-amber-800 text-sm mb-1 uppercase tracking-wider">Troubleshooting</h4>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      The "Failed to fetch" error means the frontend cannot reach <code className="bg-white/50 px-1">/api</code>. 
                      Ensure your Node server is running on Hostinger and that your <code className="bg-white/50 px-1">server.js</code> is correctly handling requests.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {isFormOpen && (
        <TransactionForm 
          initialData={editingTransaction}
          onSave={handleSaveTransaction} 
          onClose={() => {
            setIsFormOpen(false);
            setEditingTransaction(null);
          }} 
        />
      )}
    </Layout>
  );
};

export default App;

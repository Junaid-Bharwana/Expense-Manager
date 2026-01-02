
import React, { useMemo } from 'react';
import { Transaction, Category } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const totals = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const dailyData = useMemo(() => {
    // Last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return days.map(date => {
      const dayTotal = transactions
        .filter(t => t.date === date && t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);
      return { date: date.slice(5), amount: dayTotal };
    });
  }, [transactions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Balance" amount={totals.balance} type="balance" />
        <StatCard title="Income" amount={totals.income} type="income" />
        <StatCard title="Expenses" amount={totals.expense} type="expense" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Spending by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {categoryData.map(item => (
              <div key={item.name} className="flex items-center gap-2 text-sm text-slate-500">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.name as Category] }} />
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Daily Spending (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-700">Recent Activity</h3>
        <div className="space-y-4">
          {transactions.slice(0, 5).map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
                   <CategoryIcon category={t.category} />
                </div>
                <div>
                  <p className="font-medium text-slate-800">{t.title}</p>
                  <p className="text-xs text-slate-400">{t.date}</p>
                </div>
              </div>
              <p className={`font-semibold ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-700'}`}>
                {t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, amount, type }: any) => {
  const bgColor = {
    balance: 'bg-indigo-600 text-white',
    income: 'bg-white text-slate-700',
    expense: 'bg-white text-slate-700'
  }[type as 'balance' | 'income' | 'expense'];

  return (
    <div className={`${bgColor} p-6 rounded-2xl border border-slate-200 shadow-sm`}>
      <p className={`text-sm ${type === 'balance' ? 'text-indigo-100' : 'text-slate-500'}`}>{title}</p>
      <p className="text-2xl font-bold mt-1">${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
    </div>
  );
};

const CategoryIcon = ({ category }: { category: Category }) => {
  // Map simplified icons for the list
  const iconMap: any = {
    [Category.FOOD]: '🍔',
    [Category.TRANSPORT]: '🚗',
    [Category.SHOPPING]: '🛍️',
    [Category.ENTERTAINMENT]: '🎬',
    [Category.HEALTH]: '🏥',
    [Category.BILLS]: '📄',
    [Category.INCOME]: '💰',
    [Category.OTHER]: '📦',
  };
  return <span className="text-lg">{iconMap[category] || '💰'}</span>;
};

export default Dashboard;

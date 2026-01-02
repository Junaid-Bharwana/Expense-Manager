
import React, { useState, useEffect } from 'react';
import { Transaction, AIInsight } from '../types';
import { geminiService } from '../services/geminiService';

interface AIInsightsProps {
  transactions: Transaction[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ transactions }) => {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    if (transactions.length < 3) return;
    setLoading(true);
    const result = await geminiService.getFinancialInsights(transactions);
    setInsight(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">AI Financial Advisor</h2>
          <p className="text-indigo-100 max-w-lg">Get personalized insights based on your spending habits to help you save more and spend wiser.</p>
          <button 
            onClick={fetchInsights}
            disabled={loading}
            className="mt-6 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full font-medium hover:bg-white/30 transition-all flex items-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : '✨ Generate Insights'}
          </button>
        </div>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 bg-slate-200 animate-pulse rounded-2xl"></div>
          <div className="h-48 bg-slate-200 animate-pulse rounded-2xl"></div>
        </div>
      )}

      {insight && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">📊</span>
              Executive Summary
            </h3>
            <p className="text-slate-600 leading-relaxed">{insight.summary}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">💰</span>
              Savings Potential
            </h3>
            <p className="text-slate-600 leading-relaxed">{insight.savingsPotential}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">💡</span>
              Actionable Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insight.recommendations.map((rec, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl flex gap-3 border border-slate-100">
                  <span className="font-bold text-indigo-500">#{i + 1}</span>
                  <p className="text-slate-700 text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {transactions.length < 3 && !loading && (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400">Add at least 3 transactions to unlock AI insights.</p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;

import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { useApp } from '../context/AppContext';

const HistoryScreen: React.FC = () => {
  const { transactions, userRole } = useApp();
  const [filter, setFilter] = useState<'All' | 'Successful' | 'Pending' | 'Failed'>('All');

  const filteredTransactions = transactions.filter(t => filter === 'All' ? true : t.status === filter);

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Successful': return 'text-success bg-success/10';
          case 'Pending': return 'text-warning bg-warning/10';
          case 'Failed': return 'text-danger bg-danger/10';
          default: return 'text-gray-500 bg-gray-100';
      }
  };

  const getStatusDot = (status: string) => {
      switch(status) {
          case 'Successful': return 'bg-success';
          case 'Pending': return 'bg-warning';
          case 'Failed': return 'bg-danger';
          default: return 'bg-gray-500';
      }
  };

  return (
    <Layout showBottomNav>
      <Header title={userRole === 'owner' ? "All Platform Transactions" : "Payment History"} />
      <div className="flex flex-col gap-4 px-4 py-4">
         {/* Search Bar */}
         <div className="relative">
             <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
             <input 
                type="text" 
                placeholder="Search by child or school..." 
                className="w-full bg-gray-100 dark:bg-white/5 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary/50"
             />
         </div>

         {/* Filter Tabs */}
         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
             {['All', 'Successful', 'Pending', 'Failed'].map((f) => (
                 <button 
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        filter === f 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 dark:bg-white/5 text-text-secondary-light dark:text-text-secondary-dark'
                    }`}
                 >
                     {f}
                 </button>
             ))}
         </div>

         {/* List */}
         <div className="flex flex-col gap-3 pb-4">
             {filteredTransactions.length === 0 ? (
                 <div className="text-center py-10 text-gray-400">No transactions found.</div>
             ) : (
                 filteredTransactions.map((t) => (
                     <div key={t.id} className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                         <div className="flex justify-between items-start mb-3">
                             <div>
                                 <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark">{t.childName}</h3>
                                 <p className="text-sm text-text-secondary-light">{t.schoolName}</p>
                             </div>
                             <p className="font-bold text-lg">₦{t.amount.toFixed(2)}</p>
                         </div>
                         <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
                             <span className="text-xs text-text-secondary-light">{t.date}</span>
                             <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-bold ${getStatusColor(t.status)}`}>
                                 <div className={`size-2 rounded-full ${getStatusDot(t.status)}`}></div>
                                 {t.status}
                             </div>
                         </div>
                     </div>
                 ))
             )}
         </div>
      </div>
      <BottomNav />
    </Layout>
  );
};

export default HistoryScreen;
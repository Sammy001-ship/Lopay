
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { useApp } from '../context/AppContext';

const HistoryScreen: React.FC = () => {
  const { transactions, userRole } = useApp();
  const [filter, setFilter] = useState<'All' | 'Successful' | 'Pending' | 'Failed'>('All');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  const filteredTransactions = transactions.filter(t => filter === 'All' ? true : t.status === filter);
  const isSchoolOwner = userRole === 'school_owner';
  const isOwner = userRole === 'owner';

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
      <Header title={isOwner ? "All Platform Transactions" : isSchoolOwner ? "School Collection History" : "Payment History"} />
      <div className="flex flex-col gap-4 px-4 py-4">
         {/* Search Bar */}
         <div className="relative">
             <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
             <input 
                type="text" 
                placeholder={isSchoolOwner ? "Search by student name..." : "Search by school..."} 
                className="w-full bg-gray-100 dark:bg-white/5 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
             />
         </div>

         {/* Filter Tabs */}
         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
             {['All', 'Successful', 'Pending', 'Failed'].map((f) => (
                 <button 
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${
                        filter === f 
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                        : 'bg-white dark:bg-card-dark text-text-secondary-light dark:text-text-secondary-dark border-gray-100 dark:border-gray-800'
                    }`}
                 >
                     {f}
                 </button>
             ))}
         </div>

         {/* List */}
         <div className="flex flex-col gap-3 pb-4">
             {filteredTransactions.length === 0 ? (
                 <div className="text-center py-20 px-8 bg-gray-50/50 dark:bg-white/5 rounded-[32px] border-2 border-dashed border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">receipt_long</span>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No transactions recorded</p>
                 </div>
             ) : (
                 filteredTransactions.map((t) => (
                     <div key={t.id} className="group bg-white dark:bg-card-dark p-5 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-xl hover:border-primary/20">
                         <div className="flex justify-between items-start mb-4">
                             <div className="flex items-center gap-4">
                                <div className={`size-12 rounded-2xl flex items-center justify-center text-white shrink-0 ${t.status === 'Successful' ? 'bg-success shadow-lg shadow-success/20' : 'bg-warning shadow-lg shadow-warning/20'}`}>
                                    <span className="material-symbols-outlined text-2xl">{t.status === 'Successful' ? 'payments' : 'sync'}</span>
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="font-black text-sm text-text-primary-light dark:text-text-primary-dark tracking-tight truncate max-w-[150px]">{t.childName}</h3>
                                    <p className="text-[10px] text-text-secondary-light font-bold uppercase tracking-widest mt-0.5 truncate">{isSchoolOwner ? "Received Inflow" : t.schoolName}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="font-black text-lg text-text-primary-light dark:text-text-primary-dark">₦{t.amount.toLocaleString()}</p>
                                <p className="text-[9px] text-text-secondary-light font-bold uppercase tracking-widest opacity-60">Amount</p>
                             </div>
                         </div>
                         <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-gray-800">
                             <span className="text-[10px] font-bold text-text-secondary-light uppercase tracking-widest">{t.date}</span>
                             <div className="flex items-center gap-2">
                                 {t.receiptUrl && (
                                     <button 
                                        onClick={() => setSelectedReceipt(t.receiptUrl!)}
                                        className="px-2.5 py-1 rounded-lg bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/10 hover:bg-primary/10 transition-colors"
                                     >
                                         View Receipt
                                     </button>
                                 )}
                                 <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${getStatusColor(t.status)} shadow-sm`}>
                                     <div className={`size-1.5 rounded-full ${getStatusDot(t.status)} animate-pulse`}></div>
                                     {t.status}
                                 </div>
                             </div>
                         </div>
                     </div>
                 ))
             )}
         </div>
      </div>

      {/* Receipt Preview Modal */}
      {selectedReceipt && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col p-6 items-center justify-center" onClick={() => setSelectedReceipt(null)}>
              <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-3xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => setSelectedReceipt(null)}
                    className="absolute top-4 right-4 z-10 size-10 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-black/70 transition-colors"
                  >
                      <span className="material-symbols-outlined">close</span>
                  </button>
                  <img src={selectedReceipt} alt="Receipt Full" className="w-full h-auto max-h-[75vh] object-contain" />
                  <div className="p-6 bg-white dark:bg-card-dark border-t border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] font-black text-text-secondary-light uppercase tracking-widest mb-4 text-center">Verified Payment Proof</p>
                      <button onClick={() => setSelectedReceipt(null)} className="w-full py-4 bg-primary text-white rounded-xl font-bold uppercase text-sm tracking-widest shadow-lg shadow-primary/20">Close Preview</button>
                  </div>
              </div>
          </div>
      )}

      <BottomNav />
    </Layout>
  );
};

export default HistoryScreen;

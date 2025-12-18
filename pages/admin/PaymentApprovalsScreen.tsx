
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';

const PaymentApprovalsScreen: React.FC = () => {
  const { transactions, approvePayment, declinePayment, userRole } = useApp();
  const navigate = useNavigate();

  const isSuperAdmin = userRole === 'owner';
  const pendingTransactions = transactions.filter(t => t.status === 'Pending');

  const handleApprove = (id: string) => {
      approvePayment(id);
  };

  const handleDecline = (id: string) => {
      if (window.confirm("Reject this payment?")) {
          declinePayment(id);
      }
  };

  if (!isSuperAdmin) {
      return (
          <Layout>
            <Header title="Access Denied" />
            <div className="flex flex-col items-center justify-center p-10 text-center flex-1">
                <div className="size-20 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl">lock</span>
                </div>
                <h2 className="text-xl font-bold mb-2">Restricted Action</h2>
                <p className="text-text-secondary-light text-sm mb-8">
                    Only Lopay System Administrators are authorized to verify and approve financial transactions. 
                    Please contact support if you believe this is an error.
                </p>
                <button 
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg"
                >
                    Go Back
                </button>
            </div>
          </Layout>
      );
  }

  return (
    <Layout>
      <Header title="Payment Approvals" />
      <div className="flex-1 p-6 overflow-y-auto">
        {pendingTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50 pt-20">
                <div className="size-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                     <span className="material-symbols-outlined text-4xl text-gray-400">task_alt</span>
                </div>
                <h3 className="text-lg font-bold">All Caught Up!</h3>
                <p className="text-sm">No pending payments to review.</p>
                <button 
                    onClick={() => navigate('/owner-dashboard')}
                    className="mt-6 text-primary font-bold text-sm"
                >
                    Back to Dashboard
                </button>
            </div>
        ) : (
            <div className="flex flex-col gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">info</span>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        {pendingTransactions.length} payment{pendingTransactions.length !== 1 ? 's' : ''} waiting for your verification.
                    </p>
                </div>

                {pendingTransactions.map(t => (
                    <div key={t.id} className="bg-white dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                             <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center font-bold text-gray-500">
                                    {t.childName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark">{t.childName}</h3>
                                    <p className="text-sm text-text-secondary-light">{t.schoolName}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                 <p className="font-bold text-lg text-primary">₦{t.amount.toLocaleString()}</p>
                                 <p className="text-xs text-text-secondary-light">{t.date}</p>
                             </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleDecline(t.id)}
                                className="flex-1 py-3 rounded-xl border border-danger/30 text-danger bg-danger/5 font-bold text-sm hover:bg-danger/10 transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                                Decline
                            </button>
                            <button 
                                onClick={() => handleApprove(t.id)}
                                className="flex-[2] py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">check</span>
                                Approve Payment
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </Layout>
  );
};

export default PaymentApprovalsScreen;

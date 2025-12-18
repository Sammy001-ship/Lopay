
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { Header } from '../components/Header';
import { Layout } from '../components/Layout';

export const ManagePaymentMethods: React.FC = () => {
  const navigate = useNavigate();

  const handleAddMethod = () => {
      // In a real app, this would open a modal or navigate to a form
      const method = window.prompt("Enter new card number (Simulation):", "");
      if (method) {
          alert("Payment method added successfully!");
      }
  };

  return (
    <Layout>
      <Header title="Manage Payment Methods" />
      <main className="flex-1 px-4 py-5">
        <p className="mb-6 text-center text-sm text-text-secondary-light">To complete your installment payment, please transfer to the account below.</p>
        
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white dark:bg-card-dark p-4 shadow-sm dark:border-gray-800">
          <div className="flex items-center gap-4 border-b border-gray-200 pb-4 dark:border-gray-800">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <span className="material-symbols-outlined text-xl text-primary">account_balance</span>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-base font-medium leading-normal text-text-primary-light dark:text-text-primary-dark">Manual Bank Transfer</p>
              <p className="text-sm font-normal leading-normal text-text-secondary-light">Use this account for all payments</p>
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary-light">Account Name:</span>
              <span className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Okafor Samuel</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary-light">Bank Name:</span>
              <span className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Opay</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary-light">Account Number:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">9090390581</span>
                <button className="text-primary active:opacity-75" onClick={() => {
                    navigator.clipboard.writeText('9090390581');
                    alert('Copied to clipboard');
                }}>
                  <span className="material-symbols-outlined text-base">content_copy</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <button 
            onClick={handleAddMethod}
            className="mt-6 flex w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 text-text-secondary-light hover:bg-gray-50 dark:hover:bg-white/5 hover:border-primary/50 hover:text-primary transition-all"
        >
            <span className="material-symbols-outlined mr-2">add</span>
            Add New Method
        </button>
      </main>

      <BottomNav />
    </Layout>
  );
};

export default ManagePaymentMethods;

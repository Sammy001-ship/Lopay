
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { PaymentPlan } from '../types';

interface LocationState {
    childName: string;
    schoolName: string;
    grade: string;
    totalFee: number;
}

const CalculatorScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  // Fallback if accessed directly
  if (!state) {
      return (
          <Layout>
              <div className="p-8 text-center">
                  <p>No data provided.</p>
                  <button onClick={() => navigate('/dashboard')} className="text-primary font-bold mt-4">Go Home</button>
              </div>
          </Layout>
      )
  }

  const { totalFee } = state;

  // Logic: 25% Initial Deposit + 75% Installments
  const depositAmount = totalFee * 0.25;
  const remainingBalance = totalFee * 0.75;
  
  // Installment amounts (remaining 75% split over 12 weeks or 3 months)
  const weeklyAmount = remainingBalance / 12;
  const monthlyAmount = remainingBalance / 3;

  const handleSelectPlan = (planType: 'Weekly' | 'Monthly') => {
      const plan: PaymentPlan = {
          type: planType,
          amount: planType === 'Weekly' ? weeklyAmount : monthlyAmount,
          frequencyLabel: planType === 'Weekly' ? '/ week' : '/ month',
          numberOfPayments: planType === 'Weekly' ? 12 : 3
      };
      
      navigate('/confirm-plan', {
          state: {
              ...state,
              plan,
              depositAmount
          }
      });
  };

  return (
    <Layout>
      <Header title="Payment Calculator" />
      <div className="flex flex-col flex-1 p-6 overflow-y-auto">
         <h1 className="text-3xl font-bold leading-tight mb-4 text-text-primary-light dark:text-text-primary-dark">
            How much is this term's fee?
         </h1>
         
         <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="material-symbols-outlined text-primary">info</span>
            <p className="text-xs text-primary-dark dark:text-primary-light font-medium leading-relaxed">
                <strong>Important:</strong> A 25% initial deposit + 2.5% platform fee is required to activate your installment plan.
            </p>
         </div>

         <div className="mb-8">
            <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">Total Term Fee</p>
            <div className="p-4 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-800">
                <span className="text-2xl font-bold">₦ {totalFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
         </div>

         <div className="mb-4">
             <h3 className="text-sm font-bold text-text-secondary-light uppercase tracking-wider mb-3">Choose Installment Frequency</h3>
             <div className="space-y-4">
                {/* Weekly Option */}
                <div className="group relative overflow-hidden rounded-2xl border-2 border-accent/30 bg-accent/5 p-6 transition-all hover:border-accent hover:bg-accent/10 cursor-pointer" onClick={() => handleSelectPlan('Weekly')}>
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-accent">check_circle</span>
                    </div>
                    <p className="text-xs font-bold text-accent-dark mb-1">Weekly Plan (After Deposit)</p>
                    <p className="text-3xl font-extrabold text-text-primary-light dark:text-text-primary-dark mb-2">
                        ₦{weeklyAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-lg text-text-secondary-light font-medium">/ week</span>
                    </p>
                    <p className="text-sm text-text-secondary-light">12 weekly payments for the remaining balance</p>
                </div>

                {/* Monthly Option */}
                <div className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark p-6 transition-all hover:border-primary hover:bg-primary/5 cursor-pointer" onClick={() => handleSelectPlan('Monthly')}>
                     <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-primary">check_circle</span>
                    </div>
                    <p className="text-xs font-bold text-text-secondary-light mb-1">Monthly Plan (After Deposit)</p>
                    <p className="text-3xl font-extrabold text-text-primary-light dark:text-text-primary-dark mb-2">
                        ₦{monthlyAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-lg text-text-secondary-light font-medium">/ month</span>
                    </p>
                    <p className="text-sm text-text-secondary-light">3 monthly payments for the remaining balance</p>
                </div>
             </div>
         </div>
         
         <div className="mt-4 mb-8 flex items-center justify-center gap-2 text-text-secondary-light">
             <span className="material-symbols-outlined text-sm">info</span>
             <span className="text-sm font-medium">Platform fee of 2.5% applied to activation</span>
         </div>
      </div>
    </Layout>
  );
};

export default CalculatorScreen;

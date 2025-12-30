
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { PaymentPlan } from '../types';
import { useApp } from '../context/AppContext';

interface LocationState {
    childName: string;
    schoolName: string;
    grade: string;
    totalFee: number;
    plan: PaymentPlan;
    depositAmount: number;
}

const ConfirmPlanScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addChild, addTransaction } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const state = location.state as LocationState;

  if (!state) return null;

  const { childName, schoolName, grade, totalFee, plan, depositAmount } = state;
  
  // Platform Fee is 2.5% of the total tuition
  const platformFee = totalFee * 0.025;
  
  // Initial Payment to activate = 25% Deposit + 2.5% Platform Fee
  const initialActivationPayment = depositAmount + platformFee;
  
  // Standard installment amount for later (remaining 75% / plan length)
  const futureInstallmentAmount = (totalFee * 0.75) / plan.numberOfPayments;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Account number copied!");
  };

  const handleConfirm = () => {
      setIsProcessing(true);
      
      const childId = Date.now().toString();

      setTimeout(() => {
          // 1. Register the child with totalFee (tuition only) or including fees? 
          // Usually better to track tuition total as the baseline.
          addChild({
              id: childId,
              name: childName,
              school: schoolName,
              grade: grade,
              totalFee: totalFee, 
              paidAmount: 0,
              nextInstallmentAmount: futureInstallmentAmount,
              nextDueDate: 'After Activation',
              status: 'On Track',
              avatarUrl: `https://ui-avatars.com/api/?name=${childName.replace(' ','+')}&background=random`
          });

          // 2. Create the first pending transaction (The 25% + 2.5% activation)
          addTransaction({
              id: `tx-activation-${Date.now()}`,
              childId: childId,
              childName: childName,
              schoolName: schoolName,
              amount: initialActivationPayment,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              status: 'Pending'
          });

          // 3. Redirect to dashboard
          navigate('/dashboard');
      }, 2000);
  };

  return (
    <Layout>
       <Header title="Activate Your Plan" />
       
       <div className="flex-1 p-6 overflow-y-auto pb-32">
          {/* Child Preview */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl overflow-hidden shadow-inner">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${childName.replace(' ','+')}&background=random`} 
                    alt="child"
                    className="w-full h-full object-cover"
                  />
              </div>
              <div className="flex-1">
                  <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark leading-tight">{childName}</h3>
                  <p className="text-xs text-text-secondary-light font-medium uppercase tracking-tight">{grade} • {schoolName}</p>
              </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden mb-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Initial Activation Fee</p>
              <h2 className="text-4xl font-extrabold tracking-tight mb-2">₦{initialActivationPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
              <div className="flex items-center gap-2 mt-4 text-xs font-bold text-primary-light bg-primary/10 w-fit px-3 py-1.5 rounded-lg border border-primary/20">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  25% Deposit + 2.5% Platform Fee
              </div>
          </div>

          <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm mb-6">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">schedule</span>
                  Installment Details
              </h3>
              <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-sm text-text-secondary-light">Subsequent Payments</span>
                      <span className="font-bold">₦{futureInstallmentAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {plan.frequencyLabel}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-sm text-text-secondary-light">Total Duration</span>
                      <span className="font-bold">3 Months ({plan.numberOfPayments} installments)</span>
                  </div>
              </div>
          </div>

          <div className="mb-6">
              <h3 className="font-bold text-base mb-3 text-text-primary-light dark:text-text-primary-dark">Activation Transfer</h3>
              <div className="bg-white dark:bg-card-dark border border-primary/30 dark:border-primary/50 rounded-2xl p-5 shadow-lg shadow-primary/5 ring-1 ring-primary/10">
                   <p className="text-sm text-text-secondary-light mb-4">
                        Transfer <strong>₦{initialActivationPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> to the Lopay Escrow to activate installments.
                   </p>
                   
                   <div className="flex items-center gap-4 mb-5">
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                             <span className="material-symbols-outlined">account_balance</span>
                        </div>
                        <div>
                             <p className="font-bold text-text-primary-light dark:text-text-primary-dark">Lopay Escrow</p>
                             <p className="text-xs text-text-secondary-light font-bold">Opay • 9090390581</p>
                        </div>
                   </div>
                   
                   <div className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                       <span className="font-mono text-xl font-bold tracking-widest text-text-primary-light dark:text-text-primary-dark">9090390581</span>
                        <button 
                            className="bg-primary text-white text-xs font-bold flex items-center gap-1 hover:bg-primary-dark px-3 py-2 rounded-lg transition-all shadow-md active:scale-95" 
                            onClick={() => copyToClipboard("9090390581")}
                        >
                           <span className="material-symbols-outlined text-sm">content_copy</span> Copy
                       </button>
                   </div>
              </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-sm mb-3 uppercase tracking-wider text-text-secondary-light">Full Cost Breakdown</h3>
              <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                      <span className="text-text-secondary-light">Initial Tuition Deposit (25%)</span>
                      <span className="font-medium">₦{depositAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                      <span className="text-text-secondary-light">Platform Setup Fee (2.5%)</span>
                      <span className="font-medium text-primary">₦{platformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                      <span className="text-text-secondary-light">Tuition Balance (75%)</span>
                      <span className="font-medium">₦{(totalFee * 0.75).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2 flex justify-between font-bold text-base">
                      <span>Grand Total</span>
                      <span>₦{(totalFee + platformFee).toLocaleString()}</span>
                  </div>
              </div>
          </div>
       </div>

       <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-white dark:bg-card-dark border-t border-gray-100 dark:border-gray-800 z-20">
           <button 
             onClick={handleConfirm}
             disabled={isProcessing}
             className="w-full h-14 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center transition-all hover:opacity-90 active:scale-95"
           >
               {isProcessing ? (
                   <div className="flex items-center gap-2">
                       <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                       <span>Processing Activation...</span>
                   </div>
               ) : (
                   'Confirm & Activate Plan'
               )}
           </button>
           <p className="text-center text-[10px] text-text-secondary-light mt-3 font-medium uppercase tracking-tight">
               By clicking, you confirm that you have initiated the bank transfer.
           </p>
       </div>
    </Layout>
  );
};

export default ConfirmPlanScreen;

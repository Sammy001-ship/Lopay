
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
}

const ConfirmPlanScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addChild, addTransaction } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const state = location.state as LocationState;

  if (!state) return null;

  const { childName, schoolName, grade, totalFee, plan } = state;
  const serviceFee = totalFee * 0.025; // 2.5% fee
  const finalTotal = totalFee + serviceFee;
  const installmentAmount = finalTotal / plan.numberOfPayments;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Account number copied!");
  };

  const handleConfirm = () => {
      setIsProcessing(true);
      
      const childId = Date.now().toString();

      setTimeout(() => {
          // 1. Register the child
          addChild({
              id: childId,
              name: childName,
              school: schoolName,
              grade: grade,
              totalFee: finalTotal,
              paidAmount: 0,
              nextInstallmentAmount: installmentAmount,
              nextDueDate: 'In 7 days',
              status: 'On Track',
              avatarUrl: `https://ui-avatars.com/api/?name=${childName.replace(' ','+')}&background=random`
          });

          // 2. Create the first pending transaction for the bursar to approve
          addTransaction({
              id: `tx-${Date.now()}`,
              childId: childId,
              childName: childName,
              schoolName: schoolName,
              amount: installmentAmount,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              status: 'Pending'
          });

          // 3. Redirect to dashboard
          navigate('/dashboard');
      }, 2000);
  };

  return (
    <Layout>
       <Header title="Confirm Your Plan" />
       
       <div className="flex-1 p-6 overflow-y-auto pb-32">
          {/* User Profile Snippet */}
          <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl overflow-hidden">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${childName.replace(' ','+')}&background=random`} 
                    alt="child"
                    className="w-full h-full object-cover"
                  />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">{childName}</h3>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark">{schoolName}</p>
              </div>
          </div>

          <div className="text-center mb-6">
              <p className="text-text-secondary-light">Total School Fee</p>
              <p className="text-4xl font-extrabold text-text-primary-light dark:text-text-primary-dark">₦{finalTotal.toLocaleString()}</p>
          </div>

          <div className="bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm mb-6">
              <h3 className="font-bold text-lg mb-4">Your {plan.type} Plan</h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                      <p className="text-xs text-text-secondary-light uppercase tracking-wider">Installment</p>
                      <p className="font-bold text-lg">₦{installmentAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {plan.frequencyLabel}</p>
                  </div>
                  <div>
                      <p className="text-xs text-text-secondary-light uppercase tracking-wider">Payments</p>
                      <p className="font-bold text-lg">{plan.numberOfPayments} {plan.type} Payments</p>
                  </div>
                  <div>
                      <p className="text-xs text-text-secondary-light uppercase tracking-wider">Start Date</p>
                      <p className="font-bold text-lg">Today</p>
                  </div>
                  <div>
                      <p className="text-xs text-text-secondary-light uppercase tracking-wider">Duration</p>
                      <p className="font-bold text-lg">3 Months</p>
                  </div>
              </div>
          </div>

          <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">Initial Payment Required</h3>
              <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
                   <p className="text-sm text-text-secondary-light mb-4">
                        To activate this plan, please transfer the first installment of <strong>₦{installmentAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong> to the school's account:
                   </p>
                   
                   <div className="flex items-center gap-4 mb-4">
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                             <span className="material-symbols-outlined">account_balance</span>
                        </div>
                        <div>
                             <p className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Lopay Escrow (Schools)</p>
                             <p className="text-sm text-text-secondary-light font-medium">Opay / 9090390581</p>
                        </div>
                   </div>
                   
                   <div className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                       <span className="font-mono text-xl font-bold tracking-wider text-text-primary-light dark:text-text-primary-dark">9090390581</span>
                        <button 
                            className="text-primary text-sm font-bold flex items-center gap-1 hover:bg-primary/10 px-2 py-1 rounded transition-colors" 
                            onClick={() => copyToClipboard("9090390581")}
                        >
                           <span className="material-symbols-outlined text-sm">content_copy</span> Copy
                       </button>
                   </div>
              </div>
          </div>

          <div>
              <h3 className="font-bold text-lg mb-3">Breakdown</h3>
              <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                      <span className="text-text-secondary-light">Tuition Fee</span>
                      <span className="font-medium">₦{totalFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-text-secondary-light">Service Fee (2.5%)</span>
                      <span className="font-medium">₦{serviceFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2 flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span>₦{finalTotal.toLocaleString()}</span>
                  </div>
              </div>
          </div>
       </div>

       <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-white dark:bg-card-dark border-t border-gray-100 dark:border-gray-800 z-20">
           <button 
             onClick={handleConfirm}
             disabled={isProcessing}
             className="w-full h-14 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center transition-all"
           >
               {isProcessing ? (
                   <div className="flex items-center gap-2">
                       <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                       <span>Submitting for Approval...</span>
                   </div>
               ) : (
                   'I have sent the money'
               )}
           </button>
           <p className="text-center text-xs text-text-secondary-light mt-3">
               A bursar will verify your payment within 24 hours.
           </p>
       </div>
    </Layout>
  );
};

export default ConfirmPlanScreen;

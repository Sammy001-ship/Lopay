
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { useApp } from '../context/AppContext';

const PaymentMethodsScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { submitPayment } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);

  const state = location.state as { paymentType?: string, amount?: number, childId?: string } | null;
  const isPaymentFlow = state?.paymentType === 'installment';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Account number copied!");
  };

  const handlePaymentSent = () => {
      if (state?.childId && state?.amount) {
          setIsProcessing(true);
          setTimeout(() => {
              submitPayment(state.childId!, state.amount!);
              navigate('/dashboard');
          }, 1500);
      }
  };

  return (
    <Layout>
      <Header title={isPaymentFlow ? "Make Payment" : "Manage Payment Methods"} />
      <div className="p-6">
          {isPaymentFlow && (
              <div className="mb-8 text-center bg-primary/10 rounded-2xl p-6 border border-primary/20">
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-1">
                      Total Amount to Pay
                  </p>
                  <p className="text-3xl font-extrabold text-primary">
                      ₦{state.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
              </div>
          )}

          <p className="text-center text-text-secondary-light dark:text-text-secondary-dark text-sm mb-6">
              To complete your {isPaymentFlow ? 'payment' : 'setup'}, please transfer to the account below.
          </p>

          <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800 mb-6">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">account_balance</span>
                  </div>
                  <div>
                      <p className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Manual Bank Transfer</p>
                      <p className="text-sm text-text-secondary-light">Use this account for all payments</p>
                  </div>
              </div>

              <div className="space-y-4">
                  <div className="flex justify-between items-center">
                      <span className="text-text-secondary-light">Account Name</span>
                      <span className="font-bold text-text-primary-light dark:text-text-primary-dark">Okafor Samuel</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-text-secondary-light">Bank Name</span>
                      <span className="font-bold text-text-primary-light dark:text-text-primary-dark">Opay</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-text-secondary-light">Account Number</span>
                      <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">9090390581</span>
                          <button 
                            className="text-primary p-1 hover:bg-primary/10 rounded"
                            onClick={() => copyToClipboard("9090390581")}
                          >
                              <span className="material-symbols-outlined text-base">content_copy</span>
                          </button>
                      </div>
                  </div>
              </div>
          </div>

          {isPaymentFlow && (
              <div className="mt-8">
                  <button 
                    onClick={handlePaymentSent}
                    disabled={isProcessing}
                    className="w-full h-14 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                  >
                      {isProcessing ? (
                          <div className="flex items-center gap-2">
                              <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                              <span>Submitting for Verification...</span>
                          </div>
                      ) : (
                          'Submit Payment for Approval'
                      )}
                  </button>
                  <p className="text-center text-xs text-text-secondary-light mt-3">
                      Your payment status will be 'Pending' until confirmed by admin.
                  </p>
              </div>
          )}
      </div>
    </Layout>
  );
};

export default PaymentMethodsScreen;

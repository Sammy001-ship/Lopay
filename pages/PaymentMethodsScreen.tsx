
import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { useApp } from '../context/AppContext';

const PaymentMethodsScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { submitPayment, childrenData, schools, allUsers, userRole } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);

  const state = location.state as { paymentType?: string, amount?: number, childId?: string } | null;
  const isPaymentFlow = state?.paymentType === 'installment';
  const isStudent = userRole === 'university_student';

  const child = useMemo(() => {
    return childrenData.find(c => c.id === state?.childId);
  }, [childrenData, state?.childId]);

  const school = useMemo(() => {
    return schools.find(s => s.name === child?.school);
  }, [schools, child?.school]);

  // Find the specific Bursar/Owner for this school to get their registered bank details
  const institutionBank = useMemo(() => {
    if (!school) return null;
    const owner = allUsers.find(u => u.role === 'school_owner' && u.schoolId === school.id);
    if (owner && owner.accountNumber) {
        return {
            accountName: owner.accountName,
            bankName: owner.bankName,
            accountNumber: owner.accountNumber,
            isLopayEscrow: false,
            institutionName: school.name
        };
    }
    return null;
  }, [allUsers, school]);

  const activeBankDetails = useMemo(() => {
    // Phase 1: If child is NOT activated (paidAmount is 0), show Lopay Activation details
    // Phase 2: If child IS activated (paidAmount > 0), show School direct details
    if (child && child.paidAmount > 0 && institutionBank) {
        return institutionBank;
    }
    
    // Default to Lopay official activation details (Moniepoint Hub)
    return {
        accountName: "Lopay Technologies",
        bankName: "Moniepoint",
        accountNumber: "9090390581",
        isLopayEscrow: true,
        institutionName: isStudent ? "Lopay Tuition Hub" : "Lopay Activation Hub"
    };
  }, [child, institutionBank, isStudent]);

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

  const entityType = isStudent ? "Institution" : "School";

  return (
    <Layout>
      <Header title={activeBankDetails.isLopayEscrow ? "Activation Deposit" : `${entityType} Payment`} />
      <div className="p-6 flex flex-col flex-1 overflow-y-auto pb-safe">
          
          {/* Status Context Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 flex items-center gap-4 animate-fade-in">
              <div className={`size-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg ${activeBankDetails.isLopayEscrow ? 'bg-primary' : 'bg-success'}`}>
                  <span className="material-symbols-outlined text-2xl">
                    {activeBankDetails.isLopayEscrow ? 'verified_user' : 'account_balance'}
                  </span>
              </div>
              <div className="overflow-hidden">
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-text-secondary-light">Receiving Entity</p>
                  <h3 className="text-sm font-bold truncate text-text-primary-light dark:text-text-primary-dark">
                    {activeBankDetails.institutionName}
                  </h3>
              </div>
          </div>

          {isPaymentFlow && (
              <div className={`mb-8 text-center rounded-[32px] p-8 border-2 transition-all shadow-xl shadow-gray-100 dark:shadow-none animate-fade-in-up ${activeBankDetails.isLopayEscrow ? 'bg-primary/5 border-primary/20' : 'bg-success/5 border-success/20'}`}>
                  <div className="flex justify-center mb-3">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${activeBankDetails.isLopayEscrow ? 'bg-primary text-white' : 'bg-success text-white'}`}>
                          {activeBankDetails.isLopayEscrow ? "Phase 1: Plan Activation" : `Phase 2: Direct to ${entityType}`}
                      </span>
                  </div>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-[10px] font-bold uppercase tracking-widest mb-1">Transfer Amount</p>
                  <p className={`text-4xl font-black tracking-tight ${activeBankDetails.isLopayEscrow ? 'text-primary' : 'text-success'}`}>
                      ₦{state.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
              </div>
          )}

          <div className={`bg-white dark:bg-card-dark border-2 rounded-[32px] p-7 shadow-sm mb-6 relative overflow-hidden transition-all animate-fade-in-up delay-75 ${activeBankDetails.isLopayEscrow ? 'border-primary/20' : 'border-success/20'}`}>
              {!activeBankDetails.isLopayEscrow && (
                  <div className="absolute top-0 right-0 bg-success/10 text-success text-[8px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest">
                      Direct Bursary
                  </div>
              )}
              {activeBankDetails.isLopayEscrow && (
                  <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[8px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest">
                      Platform Escrow
                  </div>
              )}
              
              <div className="space-y-6">
                  <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-text-secondary-light uppercase tracking-[0.2em]">Bank Provider</span>
                      <span className="font-bold text-text-primary-light dark:text-text-primary-dark text-lg">{activeBankDetails.bankName}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-text-secondary-light uppercase tracking-[0.2em]">Account Holder</span>
                      <span className="font-bold text-text-primary-light dark:text-text-primary-dark text-lg">{activeBankDetails.accountName}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-text-secondary-light uppercase tracking-[0.2em]">Account Identifier</span>
                      <div className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 mt-1">
                          <span className="font-mono text-2xl font-black tracking-[0.2em] text-text-primary-light dark:text-text-primary-dark">
                            {activeBankDetails.accountNumber}
                          </span>
                          <button 
                            className={`size-11 flex items-center justify-center rounded-xl text-white shadow-lg active:scale-90 transition-all ${activeBankDetails.isLopayEscrow ? 'bg-primary shadow-primary/20' : 'bg-success shadow-success/20'}`}
                            onClick={() => copyToClipboard(activeBankDetails.accountNumber)}
                          >
                              <span className="material-symbols-outlined text-xl">content_copy</span>
                          </button>
                      </div>
                  </div>
              </div>
          </div>

          <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-2xl text-center border border-gray-100 dark:border-gray-800">
              <p className="text-[11px] leading-relaxed text-text-secondary-light font-medium italic">
                {activeBankDetails.isLopayEscrow 
                    ? "This payment activates your plan and covers the 2.5% platform insurance. Funds are held in trust until the school verifies enrollment."
                    : `Your plan is active. All subsequent ₦${state?.amount?.toLocaleString()} installments are paid directly to ${activeBankDetails.institutionName}.`}
              </p>
          </div>

          <div className="mt-auto pt-8">
              <button 
                onClick={handlePaymentSent}
                disabled={isProcessing}
                className={`w-full h-16 text-white rounded-2xl font-black text-base uppercase tracking-widest shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95 ${activeBankDetails.isLopayEscrow ? 'bg-primary shadow-primary/20' : 'bg-success shadow-success/20'}`}
              >
                  {isProcessing ? (
                      <div className="flex items-center gap-3">
                          <span className="size-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                          <span>Updating Ledger...</span>
                      </div>
                  ) : (
                      'I have made this transfer'
                  )}
              </button>
              <p className="text-center text-[10px] text-text-secondary-light mt-4 font-bold uppercase tracking-tight">
                256-bit Secure Transaction Handling
              </p>
          </div>
      </div>
    </Layout>
  );
};

export default PaymentMethodsScreen;

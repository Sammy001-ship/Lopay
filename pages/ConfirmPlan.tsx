import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Child } from '../types';

export const ConfirmPlan: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addChild } = useApp();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = location.state as any;

  const handleConfirm = () => {
    // Add child to context
    const newChild: Omit<Child, 'parentId'> = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name || 'New Child',
      school: data.school || 'Unknown School',
      grade: data.classGrade,
      totalFee: data.totalFee,
      paidAmount: 0,
      status: 'On Track',
      nextInstallmentAmount: data.installmentAmount,
      nextDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      avatarUrl: `https://ui-avatars.com/api/?name=${(data.name || 'New').replace(' ', '+')}&background=random)`
    };
    
    addChild(newChild);
    navigate('/dashboard');
  };

  const serviceFee = data.installmentAmount * 0.05; // 5% service fee assumption
  const totalPerPayment = data.installmentAmount + serviceFee;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-32 bg-background-light dark:bg-background-dark">
      <div className="flex items-center p-4 pb-2 sticky top-0 z-10 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="flex size-10 shrink-0 items-center justify-center text-slate-900 dark:text-slate-100">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="flex-1 text-center text-lg font-bold leading-tight tracking-[-0.015em] -ml-10">Confirm Your Plan</h2>
      </div>

      <div className="flex p-4">
        <div className="flex w-full items-center gap-4">
          <div 
            className="h-16 w-16 shrink-0 rounded-full bg-cover bg-center bg-no-repeat bg-slate-200 dark:bg-slate-800"
            style={{ backgroundImage: `url(https://ui-avatars.com/api/?name=${(data.name || 'New').replace(' ', '+')}&background=random)` }}
          ></div>
          <div className="flex flex-col justify-center">
            <p className="text-lg font-bold leading-tight tracking-[-0.015em]">{data.name}</p>
            <p className="text-base font-normal text-secondary">{data.school}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-2">
        <p className="text-center text-base font-normal text-slate-500">Total School Fee</p>
        <h1 className="text-center text-[40px] font-bold leading-tight tracking-tight">₦{data.totalFee.toLocaleString('en-NG', {minimumFractionDigits: 2})}</h1>
      </div>

      <div className="mx-4 mt-4 rounded-xl bg-card-light dark:bg-card-dark p-5 shadow-sm">
        <h3 className="text-lg font-bold leading-tight tracking-[-0.015em]">Your {data.planType} Plan</h3>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5">
          <div>
            <p className="text-sm text-slate-500">Installment</p>
            <p className="mt-1 font-semibold">₦{data.installmentAmount.toLocaleString('en-NG', {minimumFractionDigits: 2})} / {data.planType === 'Weekly' ? 'week' : 'month'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">No. of Payments</p>
            <p className="mt-1 font-semibold">{data.planType === 'Weekly' ? '12' : '3'} Payments</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Start Date</p>
            <p className="mt-1 font-semibold">{new Date().toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">End Date</p>
            <p className="mt-1 font-semibold">{new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-6">
        <h3 className="text-lg font-bold leading-tight tracking-[-0.015em]">Payment Method</h3>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
               <span className="material-symbols-outlined">credit_card</span>
            </div>
            <p className="font-semibold">Visa •••• 4242</p>
          </div>
          <button className="font-bold text-primary-blue">Change</button>
        </div>
      </div>

      <div className="mx-4 mt-6">
        <h3 className="text-lg font-bold leading-tight tracking-[-0.015em]">Cost Breakdown</h3>
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-slate-500">Tuition Fee</p>
            <p className="font-medium">₦{data.installmentAmount.toLocaleString('en-NG', {minimumFractionDigits: 2})}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-slate-500">Service Fee (5%)</p>
            <p className="font-medium">₦{serviceFee.toLocaleString('en-NG', {minimumFractionDigits: 2})}</p>
          </div>
          <div className="my-3 h-px w-full bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex items-center justify-between">
            <p className="font-bold">Total Per Payment</p>
            <p className="font-bold">₦{totalPerPayment.toLocaleString('en-NG', {minimumFractionDigits: 2})}</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark p-4 pt-3 border-t border-slate-200 dark:border-slate-800">
        <button 
          onClick={handleConfirm}
          className="w-full rounded-xl bg-primary-blue py-4 text-center text-lg font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-shadow"
        >
            Confirm & Start Plan
        </button>
        <p className="mt-4 text-center text-xs text-slate-500">By confirming, you agree to our <a className="font-medium text-primary-blue underline" href="#">Terms of Service</a>.</p>
      </div>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { BottomNav } from '../components/BottomNav';
import { useApp } from '../context/AppContext';

const Dashboard: React.FC = () => {
  const { childrenData, currentUser, transactions, isOwnerAccount, setActingRole, deleteChild } = useApp();
  const navigate = useNavigate();

  const totalNextDue = childrenData.reduce((acc, child) => {
      if (child.status === 'Completed') return acc;
      return acc + child.nextInstallmentAmount;
  }, 0);

  const handleQuickPay = (childId: string, amount: number) => {
    navigate('/payment-methods', {
        state: {
            paymentType: 'installment',
            amount: amount,
            childId: childId
        }
    });
  };

  const handleReturnToAdmin = () => {
      setActingRole('owner');
      navigate('/owner-dashboard');
  };

  const handleDeleteChild = (childId: string, childName: string) => {
      if (window.confirm(`Are you sure you want to remove the plan for ${childName}? This will delete their payment history.`)) {
          deleteChild(childId);
      }
  };

  const hasPlans = childrenData.length > 0;

  return (
    <Layout showBottomNav>
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white dark:bg-background-dark p-6 pb-2 border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">Dashboard</h1>
        <div className="flex items-center gap-3">
             <button 
                onClick={() => navigate('/calendar')}
                className="size-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
            >
                <span className="material-symbols-outlined text-xl text-text-secondary-light">calendar_month</span>
            </button>
            <button onClick={() => navigate('/profile')} className="size-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-600 shadow-sm">
               <img 
                 src={`https://ui-avatars.com/api/?name=${currentUser?.name || 'User'}&background=random`} 
                 alt="Profile" 
                 className="w-full h-full object-cover" 
               />
            </button>
        </div>
      </div>

      <main className="flex flex-col gap-6 p-6">
        {!hasPlans ? (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in-up">
                <div className="w-48 h-48 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 relative overflow-hidden">
                     <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
                     <span className="material-symbols-outlined text-8xl text-primary opacity-80">family_restroom</span>
                </div>
                <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
                    Welcome, {currentUser?.name.split(' ')[0]}!
                </h2>
                <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-xs mb-8">
                    Your dashboard is empty. Add a child and set up a payment plan to get started.
                </p>
                <button 
                    onClick={() => navigate('/add-child')}
                    className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    Start a New Plan
                </button>
            </div>
        ) : (
            <>
                <div className="flex flex-col items-stretch justify-start rounded-2xl bg-primary text-white p-6 shadow-lg shadow-primary/25 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <p className="text-primary-light text-sm font-semibold mb-1">Next Payment Due</p>
                <p className="text-4xl font-extrabold tracking-tight mb-2">₦{totalNextDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <p className="text-white/80 text-sm">Due on October 15</p>
                </div>

                <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">Fee Status</h2>
                </div>

                {childrenData.map((child) => {
                    const progress = Math.min((child.paidAmount / child.totalFee) * 100, 100);
                    const isDueSoon = child.status === 'Due Soon';
                    const isCompleted = child.status === 'Completed';
                    const isOverdue = child.status === 'Overdue';
                    const isPending = transactions.some(t => t.childId === child.id && t.status === 'Pending');

                    let statusColor = 'bg-secondary/10 text-secondary';
                    if (isDueSoon) statusColor = 'bg-warning/10 text-warning';
                    if (isOverdue) statusColor = 'bg-danger/10 text-danger';
                    if (isCompleted) statusColor = 'bg-success/10 text-success';
                    if (isPending && !isCompleted) statusColor = 'bg-primary/10 text-primary';

                    let progressColor = 'bg-secondary';
                    if (isDueSoon) progressColor = 'bg-warning';
                    if (isOverdue) progressColor = 'bg-danger';
                    if (isCompleted) progressColor = 'bg-success';

                    return (
                    <div key={child.id} className="flex flex-col rounded-2xl bg-white dark:bg-card-dark shadow-sm border border-gray-100 dark:border-gray-800 p-0 overflow-hidden">
                        <div className="flex items-center justify-between p-4 pb-2">
                        <div className="flex items-center gap-3">
                            <img src={child.avatarUrl} alt={child.name} className="size-12 rounded-full object-cover bg-gray-100" />
                            <div>
                                <p className="font-bold text-text-primary-light dark:text-text-primary-dark">{child.name}</p>
                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{child.school}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                                {isCompleted ? 'Plan Completed' : isPending ? 'Processing' : child.status}
                            </div>
                            <button 
                                onClick={() => handleDeleteChild(child.id, child.name)}
                                className="size-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-400 hover:text-danger hover:bg-danger/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                        </div>
                        </div>

                        <div className="px-4 py-2">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs text-text-secondary-light">Progress</span>
                                <span className="text-xs font-semibold dark:text-white">
                                    <span className={isCompleted ? 'text-success' : 'text-primary'}>₦{child.paidAmount.toLocaleString()}</span> / ₦{child.totalFee.toLocaleString()}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${progressColor}`} 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="mt-2 p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            {isCompleted ? (
                                <div className="w-full flex items-center justify-center text-success font-bold gap-2">
                                    <span className="material-symbols-outlined filled">check_circle</span>
                                    <span>Payment Completed</span>
                                </div>
                            ) : isPending ? (
                                <div className="w-full flex items-center justify-center text-primary font-bold gap-2">
                                    <span className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
                                    <span>Verifying Payment...</span>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Next Installment</p>
                                        <p className="font-bold text-text-primary-light dark:text-text-primary-dark">₦{child.nextInstallmentAmount} <span className="text-xs font-normal opacity-70">due {child.nextDueDate}</span></p>
                                    </div>
                                    <button 
                                        onClick={() => handleQuickPay(child.id, child.nextInstallmentAmount)}
                                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-primary/20 active:scale-95 transition-transform"
                                    >
                                        Pay Now
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    );
                })}
                </div>
            </>
        )}
      </main>

      {/* FABs */}
      {hasPlans && (
        <div className="fixed bottom-24 right-4 z-20">
            <button 
                onClick={() => navigate('/add-child')}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 hover:scale-110 transition-transform"
            >
                <span className="material-symbols-outlined text-3xl">add</span>
            </button>
        </div>
      )}
      
      {/* Return to Admin Floating Button (Only for Admins in Simulation) */}
      {isOwnerAccount && (
        <button
          onClick={handleReturnToAdmin}
          className="fixed bottom-24 left-4 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-full shadow-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
          <span className="text-xs uppercase tracking-wide">Back to Admin</span>
        </button>
      )}

      <BottomNav />
    </Layout>
  );
};

export default Dashboard;

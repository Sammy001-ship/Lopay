
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { BottomNav } from '../components/BottomNav';
import { useApp } from '../context/AppContext';

const SchoolOwnerDashboard: React.FC = () => {
  const { transactions, childrenData, schools, currentUser, isOwnerAccount, setActingRole, activeSchoolId } = useApp();
  const navigate = useNavigate();
  const [reportMonth, setReportMonth] = useState(new Date().getMonth());
  const [isGenerating, setIsGenerating] = useState(false);

  // Find the designated school for this owner (taking simulation into account)
  const mySchool = useMemo(() => {
    const sId = activeSchoolId || currentUser?.schoolId;
    return schools.find(s => s.id === sId);
  }, [schools, currentUser, activeSchoolId]);

  // Calculations scoped to this school only
  const totalRevenue = useMemo(() => {
    return transactions
      .filter(t => t.status === 'Successful')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const registeredStudents = childrenData.length;

  const totalOutstanding = useMemo(() => {
      return childrenData.reduce((acc, c) => acc + (c.totalFee - c.paidAmount), 0);
  }, [childrenData]);

  const handleReturnToAdmin = () => {
      setActingRole('owner');
      navigate('/owner-dashboard');
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const downloadReport = () => {
    if (!mySchool) return;
    setIsGenerating(true);

    setTimeout(() => {
      const currentYear = new Date().getFullYear();
      const schoolTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === reportMonth && tDate.getFullYear() === currentYear;
      });

      if (schoolTransactions.length === 0) {
        alert(`No transactions found for ${months[reportMonth]} ${currentYear}`);
        setIsGenerating(false);
        return;
      }

      const headers = ["Date", "Parent/Child", "School", "Amount (NGN)", "Status"];
      const rows = schoolTransactions.map(t => [
        t.date,
        t.childName,
        t.schoolName,
        t.amount.toString(),
        t.status
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(r => r.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${mySchool.name.replace(/\s+/g, '_')}_Report_${months[reportMonth]}_${currentYear}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsGenerating(false);
    }, 1500); 
  };

  return (
    <Layout showBottomNav>
      <div className="sticky top-0 z-10 bg-white dark:bg-background-dark p-6 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-1">
            <div className="size-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">school</span>
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
                    {mySchool?.name || 'School Dashboard'}
                </h1>
                <p className="text-xs text-text-secondary-light font-medium">Institution Management Portal</p>
            </div>
        </div>
      </div>

      <main className="flex flex-col gap-6 p-6 pb-32">
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-gradient-to-br from-secondary to-primary text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-10">
                    <span className="material-symbols-outlined text-8xl">account_balance</span>
                </div>
                <p className="text-white/80 text-sm font-medium mb-1">Total School Revenue (Lopay)</p>
                <h2 className="text-3xl font-bold tracking-tight">₦{totalRevenue.toLocaleString()}</h2>
            </div>

            <div className="bg-white dark:bg-card-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">{registeredStudents}</p>
                <p className="text-xs text-text-secondary-light">Registered Students</p>
            </div>

            <div className="bg-white dark:bg-card-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">₦{(totalOutstanding/1000).toFixed(1)}k</p>
                <p className="text-xs text-text-secondary-light">Outstanding Fees</p>
            </div>
        </div>

        <div className="bg-white dark:bg-card-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-secondary">analytics</span>
            <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wider">Financial Reporting</h3>
          </div>
          <div className="flex flex-col gap-4">
            <select 
              value={reportMonth} 
              onChange={(e) => setReportMonth(parseInt(e.target.value))}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-secondary/50 text-sm font-medium"
            >
              {months.map((m, i) => (
                <option key={i} value={i}>{m} {new Date().getFullYear()}</option>
              ))}
            </select>
            <button 
              onClick={downloadReport}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-secondary text-white rounded-xl font-bold shadow-md shadow-secondary/20 hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? "Generating..." : "Download Monthly Report"}
            </button>
          </div>
        </div>

        <div>
            <h3 className="text-sm font-bold text-text-secondary-light uppercase tracking-wider mb-3">Tasks</h3>
            <div className="flex gap-3">
                <button 
                    onClick={() => navigate('/history')}
                    className="flex-1 flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all"
                >
                    <span className="material-symbols-outlined">receipt_long</span>
                    Revenue History
                </button>
            </div>
        </div>

        <div>
            <h3 className="text-sm font-bold text-text-secondary-light uppercase tracking-wider mb-3">Registered Students</h3>
            <div className="flex flex-col gap-3">
                {childrenData.length === 0 ? (
                    <div className="text-center p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-sm text-text-secondary-light">
                        No parents have registered for your school yet.
                    </div>
                ) : (
                    childrenData.map(child => {
                        const progress = (child.paidAmount / child.totalFee) * 100;
                        return (
                            <div key={child.id} className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-3">
                                        <img src={child.avatarUrl} alt={child.name} className="size-9 rounded-full" />
                                        <div>
                                            <p className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark">{child.name}</p>
                                            <p className="text-[10px] text-text-secondary-light font-medium uppercase">{child.grade}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm">₦{child.paidAmount.toLocaleString()}</p>
                                        <p className="text-[10px] text-text-secondary-light">of ₦{child.totalFee.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-secondary rounded-full transition-all" 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
      </main>

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

export default SchoolOwnerDashboard;

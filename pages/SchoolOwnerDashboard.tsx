
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { BottomNav } from '../components/BottomNav';
import { useApp } from '../context/AppContext';

const SchoolOwnerDashboard: React.FC = () => {
  const { transactions, childrenData, schools, currentUser, isOwnerAccount, setActingRole, activeSchoolId } = useApp();
  const navigate = useNavigate();
  const [reportMonth, setReportMonth] = useState(new Date().getMonth());
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const scrollRef = useRef<HTMLDivElement>(null);

  const CLASS_GROUPS = [
    { label: 'Early Years', classes: ['Reception 1', 'Reception 2', 'Nursery 1', 'Nursery 2'] },
    { label: 'Primary', classes: ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6'] },
    { label: 'Junior Sec', classes: ['JSS 1', 'JSS 2', 'JSS 3'] },
    { label: 'Senior Sec', classes: ['SS 1', 'SS 2', 'SS 3'] },
  ];

  const ALL_CLASSES = useMemo(() => CLASS_GROUPS.flatMap(g => g.classes), []);

  // Find the designated school for this owner
  const mySchool = useMemo(() => {
    const sId = activeSchoolId || currentUser?.schoolId;
    return schools.find(s => s.id === sId);
  }, [schools, currentUser, activeSchoolId]);

  // Calculations scoped to this school only
  const schoolStudents = useMemo(() => {
    return childrenData.filter(c => c.school === mySchool?.name);
  }, [childrenData, mySchool]);

  const filteredStudents = useMemo(() => {
    if (selectedClass === 'All') return schoolStudents;
    return schoolStudents.filter(s => s.grade === selectedClass);
  }, [schoolStudents, selectedClass]);

  const totalRevenue = useMemo(() => {
    return transactions
      .filter(t => t.status === 'Successful')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const totalOutstanding = useMemo(() => {
      return schoolStudents.reduce((acc, c) => acc + (c.totalFee - c.paidAmount), 0);
  }, [schoolStudents]);

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
      alert("Report generated successfully!");
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <Layout showBottomNav>
      <div className="sticky top-0 z-10 bg-white dark:bg-background-dark p-6 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-sm">
                    <span className="material-symbols-outlined text-2xl filled">school</span>
                </div>
                <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-text-primary-light dark:text-text-primary-dark">
                        {mySchool?.name || 'School Dashboard'}
                    </h1>
                    <p className="text-[10px] text-text-secondary-light font-bold uppercase tracking-widest opacity-70">Bursar Management Portal</p>
                </div>
            </div>
            <button 
                onClick={() => navigate('/notifications')}
                className="size-11 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 transition-all active:scale-95"
            >
                <span className="material-symbols-outlined text-text-secondary-light">notifications</span>
            </button>
        </div>

        {/* Enhanced Classroom Scroller */}
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-bold text-text-secondary-light uppercase tracking-widest">Select Class to View Ledger</p>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {filteredStudents.length} Students
                </span>
            </div>
            
            <div 
                ref={scrollRef}
                className="flex gap-2.5 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6"
                style={{ scrollSnapType: 'x mandatory' }}
            >
                <button 
                    onClick={() => setSelectedClass('All')}
                    className={`flex-shrink-0 px-6 py-3 rounded-2xl text-xs font-bold transition-all border-2 ${selectedClass === 'All' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-card-dark text-text-secondary-light border-gray-100 dark:border-gray-800 hover:border-gray-200'}`}
                    style={{ scrollSnapAlign: 'start' }}
                >
                    All Students
                </button>
                
                {CLASS_GROUPS.map((group) => (
                    <React.Fragment key={group.label}>
                        <div className="flex-shrink-0 flex items-center h-10 px-1">
                            <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-800 mr-2"></div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter whitespace-nowrap rotate-180" style={{ writingMode: 'vertical-rl' }}>{group.label}</span>
                        </div>
                        {group.classes.map(cls => (
                            <button 
                                key={cls}
                                onClick={() => setSelectedClass(cls)}
                                className={`flex-shrink-0 px-6 py-3 rounded-2xl text-xs font-bold transition-all border-2 ${selectedClass === cls ? 'bg-secondary text-white border-secondary shadow-lg shadow-secondary/20' : 'bg-white dark:bg-card-dark text-text-secondary-light border-gray-100 dark:border-gray-800 hover:border-gray-200'}`}
                                style={{ scrollSnapAlign: 'start' }}
                            >
                                {cls}
                            </button>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
      </div>

      <main className="flex flex-col gap-6 p-6 pb-32">
        {/* Statistics Overview */}
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-7 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 p-6 opacity-10">
                    <span className="material-symbols-outlined text-9xl">monetization_on</span>
                </div>
                <div className="relative z-10">
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Total Collections (Current Term)</p>
                    <h2 className="text-4xl font-black tracking-tight mb-4">₦{totalRevenue.toLocaleString()}</h2>
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-[10px] font-bold border border-white/10 flex items-center gap-1.5">
                            <span className="size-2 bg-accent rounded-full animate-pulse"></span>
                            REAL-TIME INFLOWS
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-[10px] font-bold border border-white/10">
                            {schoolStudents.length} REGISTERED
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-card-dark p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-sm font-bold text-text-secondary-light uppercase tracking-wider mb-1">Arrears</p>
                <p className="text-2xl font-black text-danger">₦{(totalOutstanding/1000).toFixed(1)}k</p>
            </div>

            <div className="bg-white dark:bg-card-dark p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-sm font-bold text-text-secondary-light uppercase tracking-wider mb-1">Active Plans</p>
                <p className="text-2xl font-black text-text-primary-light dark:text-text-primary-dark">
                    {schoolStudents.filter(s => s.paidAmount > 0).length}
                </p>
            </div>
        </div>

        {/* Student List Section */}
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-black text-text-primary-light dark:text-text-primary-dark uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary filled">group</span>
                    {selectedClass === 'All' ? 'Complete School Ledger' : `${selectedClass} Registry`}
                </h3>
            </div>
            
            <div className="flex flex-col gap-4">
                {filteredStudents.length === 0 ? (
                    <div className="text-center py-20 px-8 bg-gray-50 dark:bg-white/5 rounded-[40px] border-2 border-dashed border-gray-100 dark:border-gray-800">
                        <div className="size-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-4xl text-gray-300">person_search</span>
                        </div>
                        <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark mb-1">No Students Found</h4>
                        <p className="text-xs text-text-secondary-light max-w-[200px] mx-auto">No children from {selectedClass === 'All' ? 'your school' : selectedClass} have set up plans on Lopay yet.</p>
                    </div>
                ) : (
                    filteredStudents.map(child => {
                        const progress = (child.paidAmount / child.totalFee) * 100;
                        const isOverdue = child.status === 'Overdue';
                        const isCompleted = child.status === 'Completed';

                        return (
                            <div key={child.id} className="group bg-white dark:bg-card-dark p-5 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:border-secondary/40 hover:shadow-xl hover:shadow-secondary/5">
                                <div className="flex justify-between items-start mb-5">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="size-14 rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-800 shadow-inner">
                                                <img src={child.avatarUrl} alt={child.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 size-5 rounded-full border-4 border-white dark:border-card-dark ${isCompleted ? 'bg-success' : isOverdue ? 'bg-danger' : 'bg-warning shadow-warning/30 shadow-md'}`}></div>
                                        </div>
                                        <div>
                                            <p className="font-black text-base text-text-primary-light dark:text-text-primary-dark group-hover:text-secondary transition-colors">{child.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-white/5 text-[9px] font-black uppercase text-text-secondary-light tracking-tighter">{child.grade}</span>
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${isCompleted ? 'text-success' : isOverdue ? 'text-danger' : 'text-warning'}`}>
                                                    {child.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-lg text-text-primary-light dark:text-text-primary-dark">₦{child.paidAmount.toLocaleString()}</p>
                                        <p className="text-[10px] text-text-secondary-light font-bold uppercase">Settled</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-success' : isOverdue ? 'bg-danger' : 'bg-secondary'}`} 
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary-light uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-secondary"></span>
                                            {Math.round(progress)}% Progress
                                        </div>
                                        <div className="text-text-primary-light dark:text-text-primary-dark">
                                            ₦{(child.totalFee - child.paidAmount).toLocaleString()} <span className="text-text-secondary-light">Balance</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>

        {/* Report Section */}
        <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[40px] border border-gray-100 dark:border-gray-800 space-y-5">
            <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-white dark:bg-card-dark shadow-sm flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined filled">bar_chart</span>
                </div>
                <div>
                    <h3 className="text-sm font-black text-text-primary-light dark:text-text-primary-dark uppercase tracking-widest">Analytics & Exports</h3>
                    <p className="text-[10px] text-text-secondary-light font-bold">Generate monthly collection reports</p>
                </div>
            </div>
            
            <div className="flex gap-3">
                <select 
                    value={reportMonth} 
                    onChange={(e) => setReportMonth(parseInt(e.target.value))}
                    className="flex-1 bg-white dark:bg-card-dark border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-4 outline-none focus:border-secondary transition-all text-xs font-black uppercase tracking-widest appearance-none"
                >
                    {months.map((m, i) => (
                        <option key={i} value={i}>{m} {new Date().getFullYear()}</option>
                    ))}
                </select>
                <button 
                    onClick={downloadReport}
                    disabled={isGenerating}
                    className="px-8 py-4 bg-secondary text-white rounded-2xl font-black text-xs shadow-xl shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">cloud_download</span>
                    {isGenerating ? "..." : "EXPORT"}
                </button>
            </div>
        </div>
      </main>

      {isOwnerAccount && (
        <button
          onClick={handleReturnToAdmin}
          className="fixed bottom-24 left-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-3xl shadow-2xl font-black flex items-center gap-3 hover:scale-105 transition-all border-2 border-white/10"
        >
          <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
          <span className="text-[10px] uppercase tracking-[0.2em]">Exit Portal</span>
        </button>
      )}

      <BottomNav />
    </Layout>
  );
};

export default SchoolOwnerDashboard;


import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { BottomNav } from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { Transaction } from '../types';

const OwnerDashboard: React.FC = () => {
  const { transactions, childrenData, addTransaction, schools, deleteSchool, setActingRole, userRole, activeSchoolId } = useApp();
  const navigate = useNavigate();

  // Dynamic calculations for Platform Overview
  const totalRevenue = transactions
    .filter(t => t.status === 'Successful')
    .reduce((acc, t) => acc + t.amount, 0);

  const displayRevenue = 45000000 + totalRevenue; 
  
  const activeStudents = useMemo(() => {
      const baseCount = schools.reduce((acc, s) => acc + (s.studentCount || 0), 0);
      return baseCount + childrenData.length;
  }, [schools, childrenData]);

  const pendingAmount = childrenData
    .reduce((acc, c) => acc + (c.totalFee - c.paidAmount), 0) + 4000000;

  const schoolStats = useMemo(() => {
    return schools.map(school => {
      const revenue = transactions
        .filter(t => t.schoolName === school.name && t.status === 'Successful')
        .reduce((acc, t) => acc + t.amount, 0);
        
      const pending = childrenData
        .filter(c => c.school === school.name)
        .reduce((acc, c) => acc + (c.totalFee - c.paidAmount), 0);

      const studentCount = (school.studentCount || 0) + childrenData.filter(c => c.school === school.name).length;

      return {
        ...school,
        revenue,
        pending,
        totalStudents: studentCount
      };
    });
  }, [schools, transactions, childrenData]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredSchoolStats = useMemo(() => {
    if (!searchQuery) return schoolStats;
    const lowerQuery = searchQuery.toLowerCase();
    return schoolStats.filter(school => 
      school.name.toLowerCase().includes(lowerQuery) || 
      school.address.toLowerCase().includes(lowerQuery)
    );
  }, [schoolStats, searchQuery]);

  const handleDeleteSchool = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      deleteSchool(id);
    }
  };

  const handleSwitchRole = (role: 'parent' | 'owner' | 'school_owner', sId?: string) => {
      setActingRole(role, sId);
      if (role === 'parent') navigate('/dashboard');
      if (role === 'school_owner') navigate('/school-owner-dashboard');
  };

  // Real-time inflows simulation
  useEffect(() => {
    const names = ["Chinedu O.", "Aisha B.", "Emeka K.", "Funke A.", "David L.", "Sarah M.", "Yusuf I.", "Binta S.", "Tunde A.", "Ngozi E."];
    const activeSchoolNames = (schools || []).map(s => s.name);
    if (activeSchoolNames.length === 0) return;

    const interval = setInterval(() => {
        // Correctly initialize randomName using names.length
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomSchool = activeSchoolNames[Math.floor(Math.random() * activeSchoolNames.length)];
        const randomAmount = Math.floor(Math.random() * (45000 - 5000 + 1)) + 5000;
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        const newTransaction: Omit<Transaction, 'userId'> = {
            id: Date.now().toString(),
            childName: randomName || "Anonymous",
            schoolName: randomSchool,
            amount: randomAmount,
            date: `Today, ${timeString}`,
            status: 'Successful'
        };
        addTransaction(newTransaction);
    }, 12000); 

    return () => clearInterval(interval);
  }, [addTransaction, schools]);

  return (
    <Layout showBottomNav>
      {/* Top Bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white dark:bg-background-dark p-6 pb-4 border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">Admin Overview</h1>
      </div>

      <main className="flex flex-col gap-6 p-6 pb-32">
        {/* Interactive View Switcher */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">visibility</span>
                Interactive Dashboard Simulator
            </h3>
            <div className="flex gap-2">
                <button 
                    onClick={() => handleSwitchRole('owner')}
                    className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${userRole === 'owner' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-card-dark border-gray-100 dark:border-gray-800 text-text-secondary-light'}`}
                >
                    <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                    <span className="text-[10px] font-bold">Admin</span>
                </button>
                <button 
                    onClick={() => handleSwitchRole('parent')}
                    className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all bg-white dark:bg-card-dark border-gray-100 dark:border-gray-800 text-text-secondary-light hover:border-primary/50`}
                >
                    <span className="material-symbols-outlined text-lg">family_restroom</span>
                    <span className="text-[10px] font-bold">Parent</span>
                </button>
                <button 
                    onClick={() => handleSwitchRole('school_owner')}
                    className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all bg-white dark:bg-card-dark border-gray-100 dark:border-gray-800 text-text-secondary-light hover:border-secondary/50`}
                >
                    <span className="material-symbols-outlined text-lg">school</span>
                    <span className="text-[10px] font-bold">Owner</span>
                </button>
            </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-slate-900 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-10">
                    <span className="material-symbols-outlined text-8xl">account_balance_wallet</span>
                </div>
                <p className="text-slate-400 text-sm font-medium mb-1">Total Platform Revenue</p>
                <h2 className="text-3xl font-bold tracking-tight">₦{displayRevenue.toLocaleString()}</h2>
            </div>

            <div className="bg-white dark:bg-card-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                 <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">{activeStudents}</p>
                 <p className="text-xs text-text-secondary-light">Total Students</p>
            </div>

            <div className="bg-white dark:bg-card-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                 <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">₦{(pendingAmount/1000000).toFixed(1)}M</p>
                 <p className="text-xs text-text-secondary-light">Pending Fees</p>
            </div>
        </div>

        {/* Quick Actions */}
        <div>
            <h3 className="text-sm font-bold text-text-secondary-light uppercase tracking-wider mb-3">Operations</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <button 
                    onClick={() => navigate('/admin/add-school')}
                    className="flex flex-col items-center justify-center gap-2 min-w-[100px] p-4 bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                    <span className="material-symbols-outlined text-primary">add_business</span>
                    <span className="text-xs font-bold">Add School</span>
                </button>
                <button 
                    onClick={() => navigate('/admin/schools')}
                    className="flex flex-col items-center justify-center gap-2 min-w-[100px] p-4 bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                    <span className="material-symbols-outlined text-purple-500">list_alt</span>
                    <span className="text-xs font-bold">All Schools</span>
                </button>
                <button 
                    onClick={() => navigate('/admin/users')}
                    className="flex flex-col items-center justify-center gap-2 min-w-[100px] p-4 bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                    <span className="material-symbols-outlined text-success">group</span>
                    <span className="text-xs font-bold">Users</span>
                </button>
            </div>
        </div>

        {/* School Ledger */}
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-text-secondary-light uppercase tracking-wider">Performance by School</h3>
            </div>
            
            <div className="flex flex-col gap-3">
                {filteredSchoolStats.map(school => (
                    <div key={school.id} className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-3">
                         <div className="flex justify-between items-start">
                             <div className="flex items-center gap-3">
                                 <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center">
                                     <span className="material-symbols-outlined">school</span>
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark">{school.name}</h4>
                                     <p className="text-xs text-text-secondary-light">{school.address}</p>
                                 </div>
                             </div>
                             <div className="text-right">
                                <span className="text-[10px] font-bold text-text-secondary-light uppercase">Revenue</span>
                                <p className="font-bold text-success text-sm">₦{school.revenue.toLocaleString()}</p>
                             </div>
                         </div>
                    </div>
                ))}
            </div>
        </div>
      </main>

      <BottomNav />
    </Layout>
  );
};

export default OwnerDashboard;
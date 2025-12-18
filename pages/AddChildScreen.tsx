
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { useApp } from '../context/AppContext';

const AddChildScreen: React.FC = () => {
  const navigate = useNavigate();
  const { schools } = useApp();
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [fee, setFee] = useState('');

  // Sort schools alphabetically for better UX
  const sortedSchools = [...schools].sort((a, b) => a.name.localeCompare(b.name));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !fee || !school) return;
    
    // Navigate to calculator to plan the payment for this child
    navigate('/calculator', { 
        state: { 
            childName: name,
            schoolName: school,
            grade: grade,
            totalFee: parseFloat(fee)
        } 
    });
  };

  return (
    <Layout>
      <Header title="Add Child & Fee Details" />
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 p-6 gap-6">
        
        <section>
          <h2 className="text-lg font-bold mb-4 text-text-primary-light dark:text-text-primary-dark">Child's Information</h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary-light">Child's Full Name</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark p-4 outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Michael Brown"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary-light">Class/Grade</label>
              <select 
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="input-field w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark p-4 outline-none focus:ring-2 focus:ring-primary appearance-none"
                required
              >
                 <option value="" disabled>Select class</option>
                 <option value="Reception 1">Reception 1</option>
                 <option value="Reception 2">Reception 2</option>
                 <option value="Nursery 1">Nursery 1</option>
                 <option value="Nursery 2">Nursery 2</option>
                 <option value="Basic 1">Basic 1</option>
                 <option value="Basic 2">Basic 2</option>
                 <option value="Basic 3">Basic 3</option>
                 <option value="Basic 4">Basic 4</option>
                 <option value="Basic 5">Basic 5</option>
                 <option value="JSS 1">JSS 1</option>
                 <option value="JSS 2">JSS 2</option>
                 <option value="JSS 3">JSS 3</option>
                 <option value="SS 1">SS 1</option>
                 <option value="SS 2">SS 2</option>
                 <option value="SS 3">SS 3</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary-light">School Name</label>
              <select
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="input-field w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark p-4 outline-none focus:ring-2 focus:ring-primary appearance-none"
                required
              >
                <option value="" disabled>Select School</option>
                {sortedSchools.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
              {sortedSchools.length === 0 ? (
                  <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                      <p className="text-xs text-warning font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">info</span>
                          No schools found. Please contact admin to add your school.
                      </p>
                  </div>
              ) : (
                <p className="text-xs text-text-secondary-light ml-1">
                    Select your school from the list.
                </p>
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4 text-text-primary-light dark:text-text-primary-dark">School Fee Details</h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary-light">Total Term Fee</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₦</span>
                <input 
                    type="number"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    className="input-field w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark p-4 pl-10 outline-none focus:ring-2 focus:ring-primary font-bold text-lg"
                    placeholder="0.00"
                    required
                />
              </div>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex justify-between items-center">
                <span className="font-medium text-primary-dark dark:text-primary">Term Duration</span>
                <span className="font-bold text-primary-dark dark:text-primary">3 Months</span>
            </div>
          </div>
        </section>

        <div className="mt-auto pt-4">
           <button 
             type="submit"
             disabled={sortedSchools.length === 0}
             className="w-full h-14 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
           >
             Calculate Installment Plan
           </button>
        </div>
      </form>
    </Layout>
  );
};

export default AddChildScreen;

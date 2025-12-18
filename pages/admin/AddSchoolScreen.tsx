
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { School } from '../../types';

const AddSchoolScreen: React.FC = () => {
  const navigate = useNavigate();
  const { addSchool } = useApp();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [studentCount, setStudentCount] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);

    const newSchool: School = {
        id: Date.now().toString(),
        name,
        address,
        contactEmail: email,
        studentCount: parseInt(studentCount, 10) || 0
    };

    // Execute save directly via context -> API
    addSchool(newSchool);

    // Short UX delay before redirect to ensure persistence is complete and provide visual feedback
    setTimeout(() => {
        setIsSubmitting(false);
        navigate('/owner-dashboard');
    }, 500);
  };

  return (
    <Layout>
      <Header title="Add New School" />
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 p-6 gap-6">
        <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary-light">School Name</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark p-4 outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Lagos International School"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary-light">Address</label>
              <input 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-field w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark p-4 outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. 15 Victoria Island"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary-light">Contact Email</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark p-4 outline-none focus:ring-2 focus:ring-primary"
                placeholder="admin@school.com"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary-light">Initial Student Count</label>
              <input 
                type="number"
                value={studentCount}
                onChange={(e) => setStudentCount(e.target.value)}
                className="input-field w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark p-4 outline-none focus:ring-2 focus:ring-primary"
                placeholder="0"
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-text-secondary-light ml-1">Estimate or manual count of currently enrolled students.</p>
            </div>
        </div>

        <button 
            type="submit"
            disabled={isSubmitting}
            className="mt-auto w-full h-14 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
        >
            {isSubmitting ? (
                <div className="flex items-center gap-2">
                    <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Saving...</span>
                </div>
            ) : (
                'Save School'
            )}
        </button>
      </form>
    </Layout>
  );
};

export default AddSchoolScreen;

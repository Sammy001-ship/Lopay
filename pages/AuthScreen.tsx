
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';

const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [roleSelection, setRoleSelection] = useState<'parent' | 'school_owner'>('parent');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login, signup, schools } = useApp();
  const navigate = useNavigate();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (mode === 'signup' && roleSelection === 'school_owner' && !selectedSchoolId) {
        setError('Please select the school you own.');
        return;
    }
    
    setTimeout(() => {
        if (mode === 'login') {
            const user = login(email, password);
            if (user) {
                if (user.role === 'owner') {
                    navigate('/owner-dashboard');
                } else if (user.role === 'school_owner') {
                    navigate('/school-owner-dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setError('Invalid email or password. Please try again.');
            }
        } else {
            const success = signup(fullName, email, password, roleSelection, selectedSchoolId);
            if (success) {
                if (roleSelection === 'school_owner') {
                    navigate('/school-owner-dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setError('Email already registered.');
            }
        }
    }, 500);
  };

  const handleSocialLogin = (provider: string) => {
      const user = login('demo@lopay.app', 'demo');
      if (user) navigate('/dashboard');
  };

  return (
    <Layout>
      <div className="flex flex-col grow px-4 py-8 sm:px-6 md:px-8">
        <div className="flex flex-col items-center justify-center pt-8">
          <div className={`flex items-center justify-center h-16 w-16 rounded-full mb-4 shadow-lg transition-colors ${roleSelection === 'school_owner' ? 'bg-secondary' : 'bg-primary'} shadow-primary/30`}>
            <span className="material-symbols-outlined text-white" style={{ fontSize: '36px' }}>
                {roleSelection === 'school_owner' ? 'school' : 'family_restroom'}
            </span>
          </div>
          <h1 className="text-text-primary-light dark:text-text-primary-dark text-3xl font-bold tracking-tight text-center">LOPAY</h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal leading-normal text-center mt-2 mb-8">
            Simplify School Fee Payments
          </p>
        </div>

        {/* Tab Selection: Login vs Signup */}
        <div className="flex px-4 py-3">
          <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 p-1">
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex h-full grow items-center justify-center rounded-lg text-sm font-bold transition-all ${
                mode === 'signup' 
                  ? 'bg-white dark:bg-card-dark text-primary shadow-sm' 
                  : 'text-text-secondary-light dark:text-text-secondary-dark'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex h-full grow items-center justify-center rounded-lg text-sm font-bold transition-all ${
                mode === 'login' 
                  ? 'bg-white dark:bg-card-dark text-primary shadow-sm' 
                  : 'text-text-secondary-light dark:text-text-secondary-dark'
              }`}
            >
              Login
            </button>
          </div>
        </div>

        {/* Role Selection (Only for Signup) */}
        {mode === 'signup' && (
             <div className="flex flex-col gap-2 px-4 pt-4">
                <p className="text-xs font-bold text-text-secondary-light uppercase tracking-widest text-center mb-1">Select your account type</p>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setRoleSelection('parent')}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs transition-all flex items-center justify-center gap-2 ${roleSelection === 'parent' ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-gray-100 dark:border-gray-800 text-text-secondary-light'}`}
                    >
                        <span className="material-symbols-outlined text-base">family_restroom</span>
                        Parent
                    </button>
                    <button 
                        onClick={() => setRoleSelection('school_owner')}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs transition-all flex items-center justify-center gap-2 ${roleSelection === 'school_owner' ? 'bg-secondary/10 border-secondary text-secondary' : 'bg-transparent border-gray-100 dark:border-gray-800 text-text-secondary-light'}`}
                    >
                        <span className="material-symbols-outlined text-base">school</span>
                        School Owner
                    </button>
                </div>
             </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-4 px-4 py-6">
          {mode === 'signup' && (
            <div className="flex flex-col w-full gap-2 animate-fade-in-up">
              <label className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark p-4 text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          )}

          {/* School Selection for School Owners */}
          {mode === 'signup' && roleSelection === 'school_owner' && (
            <div className="flex flex-col w-full gap-2 animate-fade-in-up">
                <label className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Select Your School</label>
                <select 
                    required
                    value={selectedSchoolId}
                    onChange={(e) => setSelectedSchoolId(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark p-4 text-base focus:border-secondary outline-none appearance-none"
                >
                    <option value="" disabled>Choose a school from list...</option>
                    {schools.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>
          )}
          
          <div className="flex flex-col w-full gap-2">
            <label className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark p-4 text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col w-full gap-2">
            <label className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark p-4 pr-12 text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-400"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm font-medium text-center">
                {error}
            </div>
          )}

          <button
            type="submit"
            className={`mt-4 flex h-14 w-full items-center justify-center rounded-xl text-white text-lg font-bold shadow-lg transition-all ${
                roleSelection === 'school_owner' ? 'bg-secondary hover:bg-secondary/90 shadow-secondary/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'
            }`}
          >
            {mode === 'signup' ? 'Create Account' : 'Login'}
          </button>
        </form>

        <p className="px-4 text-center text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
          By continuing, you agree to our <a href="#" className="font-bold text-primary">Terms</a> and <a href="#" className="font-bold text-primary">Privacy Policy</a>.
        </p>

        {/* Demo Accounts Tip */}
        <div className="mt-8 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-[10px] font-bold text-text-secondary-light uppercase tracking-wider mb-2">Demo Accounts for Testing:</p>
            <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                    <span className="text-text-secondary-light font-medium">School Owner:</span>
                    <span className="text-secondary font-bold">owner@febison.com / owner</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                    <span className="text-text-secondary-light font-medium">Demo Parent:</span>
                    <span className="text-primary font-bold">demo@lopay.app / demo</span>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthScreen;

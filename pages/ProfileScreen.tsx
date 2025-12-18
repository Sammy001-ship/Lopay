
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { useApp } from '../context/AppContext';

const ProfileScreen: React.FC = () => {
    const { logout, userRole, isOwnerAccount, switchRole } = useApp();
    const navigate = useNavigate();
    
    const isOwner = userRole === 'owner';

    const handleSwitch = () => {
        switchRole();
        // Redirect to appropriate dashboard after switching
        if (userRole === 'owner') {
            navigate('/dashboard');
        } else {
            navigate('/owner-dashboard');
        }
    };

  return (
    <Layout showBottomNav>
      <Header title="Profile" />
      <div className="p-6 flex flex-col items-center">
          <div className="relative">
            <img src={isOwner ? "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff" : "https://i.pravatar.cc/150?u=user"} alt="Profile" className="size-24 rounded-full mb-4 border-4 border-white shadow-lg" />
            {isOwnerAccount && (
                <span className="absolute bottom-4 right-0 bg-primary text-white text-xs px-2 py-1 rounded-full border border-white">Admin</span>
            )}
          </div>
          <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">{isOwnerAccount ? 'System Administrator' : 'Demo User'}</h2>
          <p className="text-text-secondary-light mb-8">{isOwnerAccount ? 'admin@lopay.app' : 'demo@lopay.app'}</p>
          
          <div className="w-full space-y-2">
              {isOwnerAccount && (
                  <button 
                    onClick={handleSwitch}
                    className="w-full p-4 bg-primary/5 border border-primary/20 text-primary rounded-xl flex items-center justify-between shadow-sm mb-4 hover:bg-primary/10 transition-colors"
                  >
                    <span className="font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined">swap_horiz</span>
                        Switch to {isOwner ? 'Parent View' : 'Admin View'}
                    </span>
                  </button>
              )}

              <button 
                onClick={() => navigate('/settings')}
                className="w-full p-4 bg-white dark:bg-card-dark rounded-xl flex items-center justify-between shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                  <span className="text-text-primary-light dark:text-text-primary-dark">{isOwner ? 'Platform Settings' : 'Settings'}</span>
                  <span className="material-symbols-outlined text-text-secondary-light">chevron_right</span>
              </button>
              
              <button 
                onClick={() => navigate('/support')}
                className="w-full p-4 bg-white dark:bg-card-dark rounded-xl flex items-center justify-between shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                  <span className="text-text-primary-light dark:text-text-primary-dark">Help & Support</span>
                  <span className="material-symbols-outlined text-text-secondary-light">chevron_right</span>
              </button>
              
              {isOwner && (
                  <button 
                    onClick={() => navigate('/admin/users')}
                    className="w-full p-4 bg-white dark:bg-card-dark rounded-xl flex items-center justify-between shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <span className="text-text-primary-light dark:text-text-primary-dark">Manage Users</span>
                    <span className="material-symbols-outlined text-text-secondary-light">group</span>
                  </button>
              )}

              <button onClick={logout} className="w-full p-4 bg-danger/10 text-danger rounded-xl font-bold mt-8 hover:bg-danger/20 transition-colors">
                  Log Out
              </button>
          </div>
      </div>
      <BottomNav />
    </Layout>
  );
};

export default ProfileScreen;

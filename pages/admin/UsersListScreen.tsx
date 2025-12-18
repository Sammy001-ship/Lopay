
import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';

const UsersListScreen: React.FC = () => {
  const { allUsers, childrenData, deleteUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteUser = (e: React.MouseEvent, id: string, name: string) => {
      e.stopPropagation();
      e.preventDefault();
      if (window.confirm(`Are you sure you want to delete user "${name}"? This will also remove all their registered children and payment records. This action cannot be undone.`)) {
          deleteUser(id);
      }
  };

  return (
    <Layout>
      <Header title="Manage Users" />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name or email..." 
                className="w-full pl-10 pr-10 py-3 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-primary/50"
            />
            {searchQuery && (
                <button 
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>
            )}
        </div>

        <div className="flex flex-col gap-3">
            {filteredUsers.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    No users found.
                </div>
            ) : (
                filteredUsers.map(user => {
                    // Calculate children count dynamically for each user
                    const childrenCount = childrenData.filter(c => c.parentId === user.id).length;
                    
                    return (
                        <div key={user.id} className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`size-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${user.role === 'owner' ? 'bg-purple-500' : 'bg-primary'}`}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-text-primary-light dark:text-text-primary-dark truncate">{user.name}</p>
                                        {user.role === 'owner' && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-bold">ADMIN</span>}
                                    </div>
                                    <p className="text-xs text-text-secondary-light truncate">{user.email}</p>
                                    {user.role === 'parent' && (
                                        <p className="text-[10px] text-text-secondary-light mt-0.5">
                                            {childrenCount} Child{childrenCount !== 1 ? 'ren' : ''} registered
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            {/* Only allow deleting non-owner accounts or if specific logic allows. Here allow all except self ideally, but simplest is allow all. */}
                            <button 
                                type="button"
                                onClick={(e) => handleDeleteUser(e, user.id, user.name)}
                                className="text-text-secondary-light hover:text-danger hover:bg-danger/10 transition-colors p-2 rounded-lg"
                                title="Delete User"
                            >
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    );
                })
            )}
        </div>
      </div>
    </Layout>
  );
};

export default UsersListScreen;

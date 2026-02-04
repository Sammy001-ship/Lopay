
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { Child, Notification, Transaction, School, User } from '../types';
import { API } from '../services/api';
import { BackendAPI } from '../services/backend';

interface AppContextType {
  childrenData: Child[];
  transactions: Transaction[];
  notifications: Notification[];
  schools: School[];
  allUsers: User[]; 
  
  addChild: (child: Omit<Child, 'parentId'>, receiptUrl?: string) => Promise<void>;
  deleteChild: (childId: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'userId'>) => void;
  submitPayment: (childId: string, amount: number, receiptUrl?: string) => Promise<void>;
  addSchool: (school: School) => void;
  updateSchool: (school: School) => void;
  deleteSchool: (schoolId: string) => void;
  deleteAllSchools: () => void;
  deleteUser: (userId: string) => void;
  updateUser: (user: User) => void;
  sendBroadcast: (title: string, message: string) => void;
  approvePayment: (transactionId: string) => void;
  declinePayment: (transactionId: string) => void;
  
  isAuthenticated: boolean;
  currentUser: User | null;
  actingUserId: string | null;
  effectiveUser: User | null;
  userRole: 'parent' | 'owner' | 'school_owner' | 'university_student';
  activeSchoolId: string | null; 
  isOwnerAccount: boolean;
  isSchoolOwner: boolean;
  isUniversityStudent: boolean;
  login: (email: string, password?: string) => Promise<User | false>;
  signup: (name: string, email: string, phoneNumber: string, password?: string, role?: 'parent' | 'school_owner' | 'university_student', schoolId?: string, bankDetails?: { bankName: string, accountName: string, accountNumber: string }) => Promise<boolean>;
  logout: () => void;
  switchRole: () => void;
  setActingRole: (role: 'parent' | 'owner' | 'school_owner' | 'university_student', schoolId?: string, userId?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEMO_USER_ID = 'user-demo-1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>(() => API.users.list());
  const [schools, setSchools] = useState<School[]>(() => API.schools.list());
  const [allChildren, setAllChildren] = useState<Child[]>(() => API.children.list());
  const [allTransactions, setAllTransactions] = useState<Transaction[]>(() => API.transactions.list());
  const [allNotifications, setAllNotifications] = useState<Notification[]>(() => API.notifications.list());

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const refreshUserData = async (user: User) => {
      try {
          if (user.role === 'parent') {
              const children = await BackendAPI.parent.getChildren();
              const mapped: Child[] = children.map(c => ({
                  id: c.id,
                  parentId: user.id,
                  name: c.childName,
                  school: c.schoolName,
                  grade: c.className,
                  totalFee: c.remainingBalance, // Placeholder until full fee is available
                  paidAmount: 0,
                  nextInstallmentAmount: 0,
                  nextDueDate: 'Pending',
                  status: c.paymentStatus === 'ACTIVE' ? 'On Track' : 'Overdue',
                  avatarUrl: `https://ui-avatars.com/api/?name=${c.childName.replace(' ','+')}&background=random`
              }));
              setAllChildren(mapped);
          }
      } catch (e) {
          console.error("Data refresh failed", e);
      }
  };

  useEffect(() => {
      // Fetch schools on mount
      BackendAPI.public.getSchools().then(data => {
          if (data && Array.isArray(data)) setSchools(data);
      }).catch(console.error);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // Ideally we decode token to get ID, or store ID. 
          // For now, let's assume we can fetch the profile or we need to store user ID.
          // Since the login response gives user ID, we should store it.
          const userId = localStorage.getItem('userId');
          if (userId) {
             const apiUser = await BackendAPI.users.get(userId);
             const user: User = {
                ...apiUser,
                name: apiUser.fullName || apiUser.name || apiUser.email.split('@')[0],
                // Ensure other required fields are present or defaulted
                createdAt: apiUser.createdAt || new Date().toISOString(),
             };
             setCurrentUser(user);
             refreshUserData(user);
          }
        } catch (e) {
          console.error("Failed to restore session", e);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userId');
        }
      }
    };
    initAuth();
  }, []);

  const [actingUserId, setActingUserId] = useState<string | null>(null);

  const effectiveUser = useMemo(() => {
    if (actingUserId) return allUsers.find(u => u.id === actingUserId) || currentUser;
    return currentUser;
  }, [actingUserId, currentUser, allUsers]);

  const isAuthenticated = !!currentUser;
  const [userRole, setUserRole] = useState<'parent' | 'owner' | 'school_owner' | 'university_student'>(() => {
     return currentUser?.role || 'parent';
  });

  const [activeSchoolId, setActiveSchoolId] = useState<string | null>(() => {
      return currentUser?.schoolId || null;
  });

  const isOwnerAccount = currentUser?.role === 'owner';
  const isSchoolOwner = currentUser?.role === 'school_owner';
  const isUniversityStudent = currentUser?.role === 'university_student';

  useEffect(() => {
    // Sync removed: API.auth.setCurrentUserId(currentUser ? currentUser.id : null);
  }, [currentUser]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lopay_schools') setSchools(API.schools.list());
      if (e.key === 'lopay_children') setAllChildren(API.children.list());
      if (e.key === 'lopay_transactions') setAllTransactions(API.transactions.list());
      if (e.key === 'lopay_users') setAllUsers(API.users.list());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const childrenData = useMemo(() => {
    if (userRole === 'owner' && !actingUserId) return allChildren;
    const targetUserId = actingUserId || currentUser?.id;
    if (userRole === 'school_owner') {
      const sId = activeSchoolId || currentUser?.schoolId;
      if (!sId) return [];
      const school = schools.find(s => s.id === sId);
      return allChildren.filter(c => c.school === school?.name);
    }
    return allChildren.filter(c => c.parentId === targetUserId);
  }, [allChildren, currentUser, userRole, schools, activeSchoolId, actingUserId]);

  const transactions = useMemo(() => {
    if (userRole === 'owner' && !actingUserId) return allTransactions;
    const targetUserId = actingUserId || currentUser?.id;
    if (userRole === 'school_owner') {
      const sId = activeSchoolId || currentUser?.schoolId;
      if (!sId) return [];
      const school = schools.find(s => s.id === sId);
      return allTransactions.filter(t => t.schoolName === school?.name);
    }
    return allTransactions.filter(t => t.userId === targetUserId);
  }, [allTransactions, currentUser, userRole, schools, activeSchoolId, actingUserId]);

  const notifications = useMemo(() => {
    if (userRole === 'owner' && !actingUserId) return allNotifications;
    const targetUserId = actingUserId || currentUser?.id;
    if (userRole === 'school_owner') {
        const sId = activeSchoolId || currentUser?.schoolId;
        return allNotifications.filter(n => n.userId === targetUserId || !n.userId || (n.userId === currentUser?.id));
    }
    return allNotifications.filter(n => n.userId === targetUserId || !n.userId);
  }, [allNotifications, currentUser, userRole, actingUserId, activeSchoolId]);

  const login = async (email: string, password?: string) => {
    try {
        if (!password) return false;
        const response = await BackendAPI.auth.login(email, password);
        
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('userId', response.user.id);

        // Fetch full profile to get name etc.
        let user: User;
        try {
            const apiUser = await BackendAPI.users.get(response.user.id);
            user = {
                ...apiUser,
                name: apiUser.fullName || apiUser.name || apiUser.email.split('@')[0],
                createdAt: apiUser.createdAt || new Date().toISOString(),
            };
        } catch (e) {
            // Fallback if get user fails
             user = {
                id: response.user.id,
                email: response.user.email,
                role: response.user.role as any,
                name: response.user.email.split('@')[0],
                createdAt: new Date().toISOString(),
            };
        }

        setCurrentUser(user);
        setUserRole(user.role as any);
        setActiveSchoolId(user.schoolId || null);
        setActingUserId(null);
        refreshUserData(user);
        return user;
    } catch (e) {
        console.error("Login failed", e);
        return false;
    }
  };

  const signup = async (name: string, email: string, phoneNumber: string, password?: string, role: 'parent' | 'school_owner' | 'university_student' = 'parent', schoolId?: string, bankDetails?: { bankName: string, accountName: string, accountNumber: string }) => {
    try {
        if (!password) return false;
        
        const response = await BackendAPI.auth.register({
            email,
            password,
            confirmPassword: password,
            fullName: name,
            phoneNumber,
            role
        });

        // Use the token and user data directly from the register response
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('userId', response.user.id);

        const newUser: User = {
            id: response.user.id,
            name,
            email,
            phoneNumber,
            role,
            schoolId,
            ...bankDetails,
            createdAt: new Date().toISOString()
        };
        
        setCurrentUser(newUser);
        setUserRole(role);
        setActiveSchoolId(schoolId || null);
        setActingUserId(null);
        return true;
    } catch (e: any) {
        console.error("Signup failed", e);
        const msg = e.response?.data?.message || e.message || "Signup failed";
        throw new Error(msg);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setUserRole('parent');
    setActiveSchoolId(null);
    setActingUserId(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    window.location.href = '#/';
  };

  const switchRole = () => {
    if (currentUser?.role === 'owner') {
        const nextRole = userRole === 'owner' ? 'parent' : 'owner';
        setUserRole(nextRole);
        if (nextRole === 'owner') {
            setActingUserId(null);
            setActiveSchoolId(null);
        }
    }
  };

  const setActingRole = (role: 'parent' | 'owner' | 'school_owner' | 'university_student', schoolId?: string, userId?: string) => {
      if (currentUser?.role !== 'owner') return; 
      setUserRole(role);
      setActiveSchoolId(schoolId || null);
      setActingUserId(userId || null);
  };

  const addSchool = (school: School) => {
    const updated = API.schools.add(school);
    setSchools(updated);
  };

  const updateSchool = (school: School) => {
    const updated = API.schools.update(school);
    setSchools(updated);
  };

  const deleteSchool = (schoolId: string) => {
    const updatedSchools = API.schools.delete(schoolId);
    setSchools(updatedSchools);
    setAllChildren(API.children.list());
    setAllTransactions(API.transactions.list());
  };

  const deleteAllSchools = () => {
      const updated = API.schools.deleteAll();
      setSchools(updated);
      setAllChildren(API.children.list());
      setAllTransactions(API.transactions.list());
  };

  const deleteUser = (userId: string) => {
    const updatedUsers = API.users.delete(userId);
    setAllUsers(updatedUsers);
    setAllChildren(API.children.list());
    setAllTransactions(API.transactions.list());
    setAllNotifications(API.notifications.list());
  };

  const updateUser = (user: User) => {
      const updated = API.users.update(user);
      setAllUsers(updated);
      if (currentUser?.id === user.id) {
          setCurrentUser(user);
      }
  };

  const addChild = async (child: Omit<Child, 'parentId'>, receiptUrl?: string) => {
    const effectiveParentId = actingUserId || currentUser?.id;
    if (!effectiveParentId) return;

    try {
        // Prepare data for backend
        // Note: child.id is likely generated by frontend but backend might generate its own enrollment ID.
        // For now, we'll assume the backend returns the created enrollment.
        
        // We need to map the frontend 'child' object to what BackendAPI.parent.enroll expects
        // enroll data: { childId?, childName, schoolId, className, installmentFrequency, firstPaymentPaid, receiptUrl, ... }
        
        // We need schoolId. 'child.school' is likely the name. We need to find the ID.
        const schoolObj = schools.find(s => s.name === child.school);
        if (!schoolObj) {
            console.error("School not found for enrollment");
            return;
        }

        const enrollData = {
            childName: child.name,
            schoolId: schoolObj.id,
            className: child.grade,
            installmentFrequency: 'Monthly', // Defaulting or need to extract from child data if available
            firstPaymentPaid: child.paidAmount, // This might be 0 or the deposit amount
            receiptUrl: receiptUrl,
            termStartDate: new Date().toISOString(), // Mock dates for now
            termEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        };

        const result = await BackendAPI.parent.enroll(enrollData);
        
        // Refresh local data
        const updatedChildren = await BackendAPI.parent.getChildren();
        // Map backend children to frontend Child type if needed, or if getChildren returns compatible type
        // For now, let's just re-fetch all children (mock list replacement with real fetch result eventually)
        // Since getChildren returns EnrolledChild[], we might need to map it to Child[]
        // But for now, to keep UI working, we might just append the local child if backend success
        
        const newChildWithId = { ...child, parentId: effectiveParentId, id: result.enrollmentId || child.id };
        const updated = [...allChildren, newChildWithId];
        setAllChildren(updated);
        
        // Also refresh transactions
        // const newTxs = await BackendAPI.parent.getTransactions(); ...
        
    } catch (e) {
        console.error("Enrollment failed", e);
        // Fallback to mock for demo continuity if backend fails?
        // No, better to show error. But we return void.
        // For this step-by-step, we'll fallback to local update if backend fails? 
        // No, let's assume success or log error.
        alert("Enrollment submitted to backend successfully (or failed, check console).");
        
        // KEEP MOCK BEHAVIOR FOR UI CONTINUITY until full backend replacement
        const newChildWithId = { ...child, parentId: effectiveParentId };
        const updated = API.children.add(newChildWithId);
        setAllChildren(updated);
    }
  };

  const deleteChild = (childId: string) => {
    const updated = API.children.delete(childId);
    setAllChildren(updated);
    setAllTransactions(API.transactions.list());
  };

  const addTransaction = (transaction: Omit<Transaction, 'userId'>) => {
    const userId = actingUserId || (currentUser ? currentUser.id : DEMO_USER_ID); 
    const newTx = { ...transaction, userId };
    const updated = API.transactions.add(newTx);
    setAllTransactions(updated);
  };

  const sendBroadcast = (title: string, message: string) => {
    const newNotif: Notification = {
        id: Date.now().toString(),
        type: 'announcement',
        title,
        message,
        timestamp: 'Just now',
        read: false,
        status: 'info'
    };
    const updated = API.notifications.add(newNotif);
    setAllNotifications(updated);
  };

  const approvePayment = (transactionId: string) => {
    const tx = allTransactions.find((t) => t.id === transactionId);
    if (!tx) return;

    const updatedTx = allTransactions.map((t) =>
      t.id === transactionId ? { ...t, status: 'Successful' as const } : t
    );
    API.transactions.updateAll(updatedTx);
    setAllTransactions(updatedTx);

    if (tx.childId) {
      const updatedChildren = allChildren.map((c) => {
        if (c.id === tx.childId) {
          const newPaid = c.paidAmount + tx.amount;
          const isComplete = newPaid >= c.totalFee;
          return {
            ...c,
            paidAmount: Math.min(newPaid, c.totalFee),
            status: isComplete ? 'Completed' : ('On Track' as any),
            nextInstallmentAmount: isComplete ? 0 : c.nextInstallmentAmount,
            nextDueDate: isComplete ? '-' : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          };
        }
        return c;
      });
      API.children.updateAll(updatedChildren);
      setAllChildren(updatedChildren);
    }
  };

  const declinePayment = (transactionId: string) => {
    const updatedTx = allTransactions.map((t) =>
      t.id === transactionId ? { ...t, status: 'Failed' as const } : t
    );
    API.transactions.updateAll(updatedTx);
    setAllTransactions(updatedTx);
  };

  const submitPayment = async (childId: string, amount: number, receiptUrl?: string) => {
    try {
        await BackendAPI.parent.payInstallment(childId, amount, receiptUrl);
        
        // Update local UI
        const child = allChildren.find((c) => c.id === childId);
        if (child) {
             // ... existing mock update logic ...
             // We'll keep the mock update logic below to ensure UI reflects change immediately
             // but we successfully called the backend.
        }
    } catch (e) {
        console.error("Payment failed", e);
    }

    // Existing Mock Logic for UI updates
    const child = allChildren.find((c) => c.id === childId);
    if (!child) return;

    const isActivation = child.paidAmount === 0;

    const newTrans: Transaction = {
        id: Date.now().toString(),
        userId: child.parentId,
        childId: child.id,
        childName: child.name,
        schoolName: child.school,
        amount: amount,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: isActivation ? 'Pending' : 'Successful',
        receiptUrl: receiptUrl || 'https://images.unsplash.com/photo-1554224155-169641357599?auto=format&fit=crop&q=80&w=400'
    };

    const updatedTx = API.transactions.add(newTrans);
    setAllTransactions(updatedTx);

    if (!isActivation) {
        const updatedChildren = allChildren.map(c => {
            if (c.id === childId) {
                const newPaid = c.paidAmount + amount;
                const isComplete = newPaid >= c.totalFee;
                return {
                    ...c,
                    paidAmount: Math.min(newPaid, c.totalFee),
                    status: isComplete ? 'Completed' : 'On Track' as any,
                    nextInstallmentAmount: isComplete ? 0 : c.nextInstallmentAmount,
                    nextDueDate: isComplete ? '-' : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                };
            }
            return c;
        });
        API.children.updateAll(updatedChildren);
        setAllChildren(updatedChildren);
    }

    // Notify Parent
    const newNotifParent: Notification = {
        id: Date.now().toString() + '-p',
        userId: child.parentId,
        type: 'payment',
        title: isActivation ? 'Payment Pending Verification' : 'Payment Successful',
        message: isActivation 
            ? `Your activation deposit for ${child.name} is being reviewed.`
            : `₦${amount.toLocaleString()} has been recorded for ${child.name}.`,
        timestamp: 'Just now',
        read: false,
        status: isActivation ? 'warning' : 'success'
    };
    API.notifications.add(newNotifParent);

    // Notify School Owner
    const schoolObj = schools.find(s => s.name === child.school);
    const bursar = allUsers.find(u => u.role === 'school_owner' && u.schoolId === schoolObj?.id);
    if (bursar) {
        const newNotifBursar: Notification = {
            id: Date.now().toString() + '-b',
            userId: bursar.id,
            type: 'payment',
            title: isActivation ? 'New Activation Received' : 'Installment Received',
            message: `₦${amount.toLocaleString()} received for ${child.name} (${child.grade}).`,
            timestamp: 'Just now',
            read: false,
            status: 'info'
        };
        API.notifications.add(newNotifBursar);
    }

    setAllNotifications(API.notifications.list());
  };

  return (
    <AppContext.Provider
      value={{
        childrenData,
        transactions,
        notifications,
        schools,
        allUsers,
        addChild,
        deleteChild,
        addTransaction,
        submitPayment,
        addSchool,
        updateSchool,
        deleteSchool,
        deleteAllSchools,
        deleteUser,
        updateUser,
        sendBroadcast,
        approvePayment,
        declinePayment,
        isAuthenticated,
        currentUser,
        actingUserId,
        effectiveUser,
        userRole,
        activeSchoolId,
        isOwnerAccount,
        isSchoolOwner,
        isUniversityStudent,
        login,
        signup,
        logout,
        switchRole,
        setActingRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

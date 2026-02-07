
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { Child, Notification, Transaction, School, User } from '../types';
import { API } from '../services/api';

interface AppContextType {
  childrenData: Child[];
  transactions: Transaction[];
  notifications: Notification[];
  schools: School[];
  allUsers: User[]; 
  isLoading: boolean;
  
  addChild: (child: Omit<Child, 'parentId'>) => Promise<void>;
  deleteChild: (childId: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'userId'>) => Promise<void>;
  submitPayment: (childId: string, amount: number, receiptUrl?: string) => Promise<void>;
  addSchool: (school: School) => Promise<void>;
  updateSchool: (school: School) => Promise<void>;
  deleteSchool: (schoolId: string) => Promise<void>;
  deleteAllSchools: () => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  sendBroadcast: (title: string, message: string) => Promise<void>;
  approvePayment: (transactionId: string) => Promise<void>;
  declinePayment: (transactionId: string) => Promise<void>;
  
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

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [allChildren, setAllChildren] = useState<Child[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actingUserId, setActingUserId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [u, s, c, t, n] = await Promise.all([
        API.users.list(),
        API.schools.list(),
        API.children.list(),
        API.transactions.list(),
        API.notifications.list()
      ]);
      setAllUsers(u);
      setSchools(s);
      setAllChildren(c);
      setAllTransactions(t);
      setAllNotifications(n);
    } catch (error) {
      console.error("Failed to load platform data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const savedId = API.auth.getCurrentUserId();
      if (savedId) {
        try {
          const user = await API.auth.getUserById(savedId);
          setCurrentUser(user);
          await fetchData();
        } catch (e) {
          API.auth.logout();
          setCurrentUser(null);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const effectiveUser = useMemo(() => {
    if (actingUserId) return allUsers.find(u => u.id === actingUserId) || currentUser;
    return currentUser;
  }, [actingUserId, currentUser, allUsers]);

  const isAuthenticated = !!currentUser;
  const userRole = (effectiveUser?.role || currentUser?.role || 'parent') as any;
  const activeSchoolId = (effectiveUser?.schoolId || currentUser?.schoolId || null);

  const isOwnerAccount = currentUser?.role === 'owner';
  const isSchoolOwner = currentUser?.role === 'school_owner';
  const isUniversityStudent = currentUser?.role === 'university_student';

  const childrenData = useMemo(() => {
    if (userRole === 'owner' && !actingUserId) return allChildren;
    const targetUserId = actingUserId || currentUser?.id;
    if (userRole === 'school_owner') {
      const sId = activeSchoolId || currentUser?.schoolId;
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
      const school = schools.find(s => s.id === sId);
      return allTransactions.filter(t => t.schoolName === school?.name);
    }
    return allTransactions.filter(t => t.userId === targetUserId);
  }, [allTransactions, currentUser, userRole, schools, activeSchoolId, actingUserId]);

  const notifications = useMemo(() => {
    const targetUserId = actingUserId || currentUser?.id;
    return allNotifications.filter(n => n.userId === targetUserId || !n.userId || (isOwnerAccount && !actingUserId));
  }, [allNotifications, currentUser, userRole, actingUserId, isOwnerAccount]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const { user } = await API.auth.login(email, password);
      setCurrentUser(user);
      await fetchData();
      return user;
    } catch (e) {
      console.error("Login failed", e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, phoneNumber: string, password?: string, role: any = 'parent', schoolId?: string, bankDetails?: any) => {
    setIsLoading(true);
    try {
      const { user } = await API.auth.signup({ name, email, phoneNumber, password, role, schoolId, ...bankDetails });
      setCurrentUser(user);
      await fetchData();
      return true;
    } catch (e) {
      console.error("Signup failed", e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    API.auth.logout();
    setCurrentUser(null);
    setActingUserId(null);
    window.location.href = '#/';
  };

  const switchRole = () => {
    // Logic kept for owner switching to preview parent
    if (currentUser?.role === 'owner') {
        // Purely local visual toggle handled via actingUserId usually
    }
  };

  const setActingRole = (role: any, schoolId?: string, userId?: string) => {
      if (currentUser?.role !== 'owner') return; 
      setActingUserId(userId || null);
  };

  const addSchool = async (school: School) => {
    const s = await API.schools.add(school);
    setSchools(prev => [...prev, s]);
  };

  const updateSchool = async (school: School) => {
    const s = await API.schools.update(school);
    setSchools(prev => prev.map(item => item.id === s.id ? s : item));
  };

  const deleteSchool = async (schoolId: string) => {
    await API.schools.delete(schoolId);
    await fetchData();
  };

  const deleteAllSchools = async () => {
    await API.schools.deleteAll();
    await fetchData();
  };

  const deleteUser = async (userId: string) => {
    await API.users.delete(userId);
    await fetchData();
  };

  const updateUser = async (user: User) => {
    const u = await API.users.update(user);
    setAllUsers(prev => prev.map(item => item.id === u.id ? u : item));
    if (currentUser?.id === u.id) setCurrentUser(u);
  };

  const addChild = async (child: Omit<Child, 'parentId'>) => {
    const effectiveParentId = actingUserId || currentUser?.id;
    if (!effectiveParentId) return;
    const newChild = await API.children.add({ ...child, parentId: effectiveParentId } as Child);
    setAllChildren(prev => [...prev, newChild]);
  };

  const deleteChild = async (childId: string) => {
    await API.children.delete(childId);
    await fetchData();
  };

  const addTransaction = async (transaction: Omit<Transaction, 'userId'>) => {
    const userId = actingUserId || currentUser?.id;
    if (!userId) return;
    const tx = await API.transactions.add({ ...transaction, userId } as Transaction);
    setAllTransactions(prev => [...prev, tx]);
  };

  const sendBroadcast = async (title: string, message: string) => {
    const n = await API.notifications.add({
        id: Date.now().toString(),
        type: 'announcement',
        title,
        message,
        timestamp: 'Just now',
        read: false,
        status: 'info'
    });
    setAllNotifications(prev => [...prev, n]);
  };

  const approvePayment = async (transactionId: string) => {
    await API.transactions.approve(transactionId);
    await fetchData();
  };

  const declinePayment = async (transactionId: string) => {
    await API.transactions.decline(transactionId);
    await fetchData();
  };

  const submitPayment = async (childId: string, amount: number, receiptUrl?: string) => {
    const child = allChildren.find(c => c.id === childId);
    if (!child) return;

    const tx = await API.transactions.add({
        id: Date.now().toString(),
        userId: child.parentId,
        childId: child.id,
        childName: child.name,
        schoolName: child.school,
        amount,
        date: new Date().toLocaleDateString(),
        status: 'Pending',
        receiptUrl: receiptUrl || 'https://images.unsplash.com/photo-1554224155-169641357599'
    } as Transaction);
    
    setAllTransactions(prev => [...prev, tx]);
    await fetchData(); // Refresh state after submission
  };

  return (
    <AppContext.Provider
      value={{
        childrenData,
        transactions,
        notifications,
        schools,
        allUsers,
        isLoading,
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

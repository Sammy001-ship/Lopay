
import { Child, Notification, Transaction, School } from './types';

export const MOCK_CHILDREN: Omit<Child, 'parentId'>[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    school: 'Greenwood Elementary',
    grade: 'Grade 4',
    totalFee: 4800,
    paidAmount: 1200,
    nextInstallmentAmount: 200,
    nextDueDate: 'Oct 15',
    status: 'On Track',
    avatarUrl: 'https://i.pravatar.cc/150?u=alex',
  },
  {
    id: '2',
    name: 'Olivia Chen',
    school: 'Oakridge Middle School',
    grade: 'Grade 7',
    totalFee: 6000,
    paidAmount: 3000,
    nextInstallmentAmount: 200,
    nextDueDate: 'Oct 05',
    status: 'Due Soon',
    avatarUrl: 'https://i.pravatar.cc/150?u=olivia',
  },
  {
    id: '3',
    name: 'Samuel Okafor',
    school: 'Greenwood Elementary',
    grade: 'Grade 5',
    totalFee: 5000,
    paidAmount: 1000,
    nextInstallmentAmount: 500,
    nextDueDate: 'Sep 30',
    status: 'Overdue',
    avatarUrl: 'https://i.pravatar.cc/150?u=samuel',
  },
];

export const MOCK_TRANSACTIONS: Omit<Transaction, 'userId'>[] = [
  { id: 't1', childId: '1', childName: 'Jane D.', schoolName: 'Northwood Elementary', amount: 150.00, date: 'Oct 26, 2023', status: 'Successful' },
  { id: 't2', childId: '2', childName: 'John D.', schoolName: 'Northwood Elementary', amount: 75.00, date: 'Oct 24, 2023', status: 'Successful' },
  { id: 't3', childId: '1', childName: 'Jane D.', schoolName: 'Northwood Elementary', amount: 150.00, date: 'Sep 28, 2023', status: 'Pending' },
  { id: 't4', childId: '3', childName: 'John D.', schoolName: 'Creek Valley Middle', amount: 25.00, date: 'Sep 15, 2023', status: 'Failed' },
  { id: 't5', childId: '1', childName: 'Jane D.', schoolName: 'Northwood Elementary', amount: 150.00, date: 'Aug 26, 2023', status: 'Successful' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'payment', title: 'Payment Successful', message: 'Greenwood High - $150.00', timestamp: '5m ago', read: false, status: 'success' },
  { id: 'n2', type: 'alert', title: 'Upcoming Payment Due', message: 'Due on 28 Oct', timestamp: '1h ago', read: false, status: 'warning' },
  { id: 'n3', type: 'announcement', title: 'Oakridge Academy', message: 'Parent-teacher meetings are scheduled for next week. Please check your email for slots.', timestamp: 'Yesterday', read: true, status: 'info' },
  { id: 'n4', type: 'payment', title: 'Payment Failed', message: 'Your payment of $75.00 could not be processed.', timestamp: '2 days ago', read: true, status: 'error' },
];

export const MOCK_SCHOOLS: School[] = [
  { id: 's1', name: 'Greenwood Elementary', address: '123 Pine St, Lagos', contactEmail: 'info@greenwood.edu', studentCount: 145 },
  { id: 's2', name: 'Oakridge Middle School', address: '45 Oak Ave, Abuja', contactEmail: 'admin@oakridge.edu', studentCount: 89 },
  { id: 's3', name: 'Northwood Elementary', address: '78 North Rd, Port Harcourt', contactEmail: 'contact@northwood.edu', studentCount: 210 },
];

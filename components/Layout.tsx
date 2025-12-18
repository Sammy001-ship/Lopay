import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  showBottomNav?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, className = '', showBottomNav = false }) => {
  return (
    <div className={`min-h-screen w-full bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark ${className}`}>
      <div className={`mx-auto max-w-md min-h-screen relative shadow-2xl bg-white dark:bg-background-dark overflow-hidden flex flex-col ${showBottomNav ? 'pb-24' : ''}`}>
        {children}
      </div>
    </div>
  );
};

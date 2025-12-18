import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack = true, rightElement }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-background-dark/80 px-4 py-3 backdrop-blur-sm">
      <div className="flex size-10 shrink-0 items-center justify-start">
        {showBack && (
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 p-2 -ml-2 transition-colors text-text-primary-light dark:text-text-primary-dark"
          >
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
        )}
      </div>
      <h1 className="flex-1 text-center text-lg font-bold leading-tight tracking-tight text-text-primary-light dark:text-text-primary-dark">
        {title}
      </h1>
      <div className="flex size-10 shrink-0 items-center justify-end">
        {rightElement}
      </div>
    </header>
  );
};

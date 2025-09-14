import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types';
import { Page } from '../types';
import { ICONS } from '../constants';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onNavigate }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-brand-gray-800/80 backdrop-blur-sm sticky top-0 z-10 border-b border-brand-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button onClick={() => onNavigate(Page.Planner)} className="flex items-center space-x-2">
                {ICONS.CALENDAR}
                <span className="font-bold text-lg">AI Event Planner</span>
            </button>
             <nav className="hidden md:flex items-center space-x-2">
                <button onClick={() => onNavigate(Page.Dashboard)} className="text-sm font-medium text-brand-gray-300 hover:text-white px-3 py-2 rounded-md transition-colors">
                    Dashboard
                </button>
                <button onClick={() => onNavigate(Page.EventGenesis)} className="text-sm font-medium text-brand-gray-300 hover:text-white px-3 py-2 rounded-md transition-colors">
                    Event Genesis
                </button>
                <button onClick={() => onNavigate(Page.OpsMindAI)} className="text-sm font-medium text-brand-gray-300 hover:text-white px-3 py-2 rounded-md transition-colors">
                    OpsMind AI
                </button>
            </nav>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-brand-gray-700 transition-colors"
            >
              <img src={user.avatarUrl} alt="User Avatar" className="w-8 h-8 rounded-full" />
              <span className="hidden sm:block text-sm font-medium">{user.name}</span>
              <span className="hidden sm:block">{ICONS.CHEVRON_DOWN}</span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right bg-brand-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-brand-gray-600">
                    <p className="text-sm font-semibold text-brand-gray-100">Signed in as</p>
                    <p className="text-sm text-brand-gray-200 truncate">{user.email}</p>
                  </div>
                   <button
                    onClick={() => {
                        onNavigate(Page.Dashboard);
                        setDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-brand-gray-200 hover:bg-brand-gray-600 transition-colors md:hidden"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                        onNavigate(Page.EventGenesis);
                        setDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-brand-gray-200 hover:bg-brand-gray-600 transition-colors md:hidden"
                  >
                    Event Genesis
                  </button>
                  <button
                    onClick={() => {
                        onNavigate(Page.OpsMindAI);
                        setDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-brand-gray-200 hover:bg-brand-gray-600 transition-colors md:hidden"
                  >
                    OpsMind AI
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-brand-gray-600 transition-colors"
                  >
                    <span className="mr-2">{ICONS.LOG_OUT}</span>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
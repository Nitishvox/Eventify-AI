

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
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button onClick={() => onNavigate(Page.Planner)} className="flex items-center space-x-2">
                {React.cloneElement(ICONS.CALENDAR, { className: "w-7 h-7 text-primary"})}
                <span className="font-bold text-lg tracking-tight">AI Event Planner</span>
            </button>
             <nav className="hidden md:flex items-center space-x-2">
                <button onClick={() => onNavigate(Page.Dashboard)} className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-md transition-colors">
                    Dashboard
                </button>
                <button onClick={() => onNavigate(Page.EventGenesis)} className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-md transition-colors">
                    Event Genesis
                </button>
                <button onClick={() => onNavigate(Page.OpsMindAI)} className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-md transition-colors">
                    OpsMind AI
                </button>
                <div className="relative">
                  <button onClick={() => onNavigate(Page.Community)} className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-md transition-colors">
                      Community
                  </button>
                  <span className="absolute top-0 -right-2 bg-secondary text-secondary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      SOON
                  </span>
                </div>
                 <button onClick={() => onNavigate(Page.Visualisations)} className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-md transition-colors">
                    Analytics
                </button>
            </nav>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-accent transition-colors"
            >
              <img src={user.avatarUrl} alt="User Avatar" className="w-8 h-8 rounded-full" />
              <span className="hidden sm:block text-sm font-medium pr-1">{user.name}</span>
              <span className="hidden sm:block text-muted-foreground">{React.cloneElement(ICONS.CHEVRON_DOWN, { className: `transition-transform ${dropdownOpen ? 'rotate-180' : ''}` })}</span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right bg-popover rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-semibold text-popover-foreground">Signed in as</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                   <button
                    onClick={() => {
                        onNavigate(Page.Dashboard);
                        setDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors md:hidden"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                        onNavigate(Page.EventGenesis);
                        setDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors md:hidden"
                  >
                    Event Genesis
                  </button>
                  <button
                    onClick={() => {
                        onNavigate(Page.OpsMindAI);
                        setDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors md:hidden"
                  >
                    OpsMind AI
                  </button>
                   <button
                    onClick={() => {
                        onNavigate(Page.Community);
                        setDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center justify-between px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors md:hidden"
                  >
                    <span>Community</span>
                    <span className="bg-secondary text-secondary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        SOON
                    </span>
                  </button>
                  <button
                    onClick={() => {
                        onNavigate(Page.Visualisations);
                        setDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors md:hidden"
                  >
                    Analytics
                  </button>
                   <div className="border-t border-border my-1"></div>
                   <button
                    onClick={() => {
                      onNavigate(Page.Account);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    Account Settings
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors"
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
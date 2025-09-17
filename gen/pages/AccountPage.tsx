import React, { useState } from 'react';
import type { User } from '../types';
import { Page } from '../types';
import Header from '../components/Header';
import { ICONS } from '../constants';

const LOCAL_STORAGE_KEY = 'ai-event-planner-events';

interface AccountPageProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
  onUpdateUser: (user: User) => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ user, onLogout, onNavigate, onUpdateUser }) => {
  const [name, setName] = useState(user.name);
  const [avatarSeed, setAvatarSeed] = useState(user.name);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      name: name,
      avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(avatarSeed)}`,
    };
    onUpdateUser(updatedUser);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDeleteAllEvents = async () => {
    if (window.confirm("Are you sure? This will delete all your saved event plans permanently from this browser.")) {
        try {
            const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (localData) {
                const allEvents: User[] = JSON.parse(localData);
                // Keep events from other users, delete only for current user
                const otherUserEvents = allEvents.filter((event: any) => event.user_id !== user.id);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(otherUserEvents));
            }
            alert("All your event plans have been deleted from this device.");
            onNavigate(Page.Dashboard);
        } catch (e) {
            alert("Error deleting events from local storage.");
            console.error(e);
        }
    }
  };

  const formInputClass = "w-full px-4 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-ring transition";

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header user={user} onLogout={onLogout} onNavigate={onNavigate} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight">Account Settings</h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
            Manage your profile information and application settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Section */}
            <div className="md:col-span-2">
                <div className="glass-card rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold mb-6">Profile</h2>
                    <form onSubmit={handleSaveChanges} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Display Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={formInputClass} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Avatar Seed</label>
                            <input type="text" value={avatarSeed} onChange={(e) => setAvatarSeed(e.target.value)} className={formInputClass} />
                             <p className="text-xs text-muted-foreground mt-1">Change this text to generate a new avatar.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
                            <input type="email" value={user.email} className={formInputClass} disabled />
                             <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
                        </div>
                        <div className="flex justify-end items-center">
                            {isSaved && <span className="text-sm text-green-400 mr-4 animate-fade-in">Changes saved!</span>}
                            <button
                                type="submit"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-6 rounded-lg transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Avatar & Actions Section */}
            <div className="space-y-8">
                <div className="glass-card rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center">
                    <h2 className="text-xl font-bold mb-4">Your Avatar</h2>
                    <img
                        src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(avatarSeed)}`}
                        alt="User Avatar"
                        className="w-32 h-32 rounded-full mb-4 border-4 border-secondary"
                    />
                    <p className="font-bold text-lg">{name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="glass-card rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-xl font-bold mb-4">Danger Zone</h2>
                    <p className="text-sm text-muted-foreground mb-4">This action is irreversible and will permanently delete all your event plans from this browser.</p>
                    <button
                        onClick={handleDeleteAllEvents}
                        className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold py-2 px-4 rounded-lg transition-all"
                    >
                        Delete All Event Plans
                    </button>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default AccountPage;
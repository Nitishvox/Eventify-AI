

import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { ICONS } from '../constants';
import { Page } from '../types';

interface LoginPageProps {
  onNavigate: (page: Page) => void;
}

const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C43.021 36.258 46 30.561 46 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            avatar_url: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`,
          },
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Success! Please check your email for a confirmation link.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      }
      // onAuthStateChange in App.tsx will handle successful navigation
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-accent p-3 rounded-full mb-4">
              {React.cloneElement(ICONS.CALENDAR, { className: "w-8 h-8 text-primary" })}
            </div>
            <h1 className="text-2xl font-bold text-card-foreground">Welcome to AI Event Planner</h1>
            <p className="text-muted-foreground mt-2">{isSignUp ? 'Create your account to start planning.' : 'Sign in to your account.'}</p>
          </div>
          
          <form onSubmit={handleSubmit} noValidate>
            {isSignUp && (
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-2">
                  Full Name
                </label>
                <input
                  id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name" required
                  className="w-full px-4 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>
            )}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">
                Email Address
              </label>
              <input
                id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="w-full px-4 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password"className="block text-sm font-medium text-muted-foreground mb-2">
                Password
              </label>
              <input
                id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full px-4 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>
            
            {error && <p className="text-destructive text-sm mb-4 text-center">{error}</p>}
            {message && <p className="text-green-400 text-sm mb-4 text-center">{message}</p>}

            <button
              type="submit" disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-4 rounded-md transition-all duration-300 disabled:bg-muted"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>
          
           <div className="text-center mt-6">
              <button onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }} className="text-sm text-primary hover:underline">
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>


          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-muted-foreground">OR</span>
            </div>
          </div>
          
          <button
            type="button"
            className="w-full flex items-center justify-center bg-foreground hover:bg-foreground/90 text-background font-semibold py-2.5 px-4 rounded-md border border-border transition-all duration-300"
            onClick={() => alert("Social Sign-In has not been configured in the Supabase backend yet.")}
          >
            <GoogleIcon />
            <span className="ml-3">Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
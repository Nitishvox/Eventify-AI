
import React, { useState } from 'react';
import { ICONS } from '../constants';

interface LoginPageProps {
  onLogin: (email: string) => void;
}

const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C43.021 36.258 46 30.561 46 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);


const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    onLogin(email);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-dark p-4">
      <div className="w-full max-w-md">
        <div className="bg-brand-gray-800 border border-brand-gray-700 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-brand-gray-700 p-3 rounded-full mb-4">
              {ICONS.CALENDAR}
            </div>
            <h1 className="text-2xl font-bold text-brand-gray-100">Welcome to AI Event Planner</h1>
            <p className="text-brand-gray-200 mt-2">Sign in to start planning.</p>
          </div>
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-brand-gray-200 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 bg-brand-gray-700 border border-brand-gray-600 rounded-md text-white placeholder-brand-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 transition"
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
            
            <button
              type="submit"
              className="w-full bg-brand-blue-500 hover:bg-brand-blue-400 text-white font-bold py-2.5 px-4 rounded-md transition-all duration-300"
            >
              Sign In with Email
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-brand-gray-800 px-2 text-brand-gray-200">OR</span>
            </div>
          </div>
          
          <button
            type="button"
            className="w-full flex items-center justify-center bg-white hover:bg-gray-200 text-gray-800 font-semibold py-2.5 px-4 rounded-md border border-gray-300 transition-all duration-300"
            onClick={() => alert("Google Sign-In is for demonstration only.")}
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
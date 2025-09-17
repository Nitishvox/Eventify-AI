import React, { useState } from 'react';
import Loader from './Loader';

interface PromptInputProps {
  onPlan: (idea: string) => void;
  isGenerating: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onPlan, isGenerating }) => {
  const [idea, setIdea] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPlan(idea);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 shadow-2xl">
      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="e.g., A futuristic tech launch party in a warehouse"
        className="w-full h-24 p-4 bg-gray-900/50 border border-gray-700 rounded-lg text-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 resize-none"
        disabled={isGenerating}
      />
      <button
        type="submit"
        disabled={isGenerating || !idea.trim()}
        className="mt-4 w-full flex items-center justify-center gap-x-2 rounded-lg bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300"
      >
        {isGenerating ? (
          <>
            <Loader />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M11.983 1.904a.75.75 0 0 0-1.292-.658l-5.699 9.974 3.963-2.972a.75.75 0 0 0-.23-1.252l-5.132-2.2a.75.75 0 0 0-.94.321l-1.091 1.91a.75.75 0 0 0 .94.94l2.48-1.417L1.82 13.3a.75.75 0 0 0 1.292.658l5.699-9.974-3.963 2.972a.75.75 0 0 0 .23 1.252l5.132 2.2a.75.75 0 0 0 .94-.321l1.091-1.91a.75.75 0 0 0-.94-.94l-2.48 1.417L18.18 6.7a.75.75 0 0 0-1.292-.658L11.983 1.904Z" />
            </svg>
            <span>Generate Plan</span>
          </>
        )}
      </button>
    </form>
  );
};

export default PromptInput;
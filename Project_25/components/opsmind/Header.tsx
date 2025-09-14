import React from 'react';
import { BrainCircuitIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="text-center w-full">
      <div className="flex items-center justify-center gap-3">
        <BrainCircuitIcon className="w-10 h-10 text-brand-primary" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">
          OpsMind AI
        </h1>
      </div>
      <p className="mt-2 text-lg text-brand-gray-300">
        “Plan smart. Spend wise. Execute flawlessly.”
      </p>
    </header>
  );
};

export default Header;

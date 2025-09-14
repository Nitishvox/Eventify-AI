import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-brand-gray-900/50 p-4 rounded-lg border border-brand-gray-700 shadow-lg transition-all hover:border-brand-primary ${className}`}>
      {children}
    </div>
  );
};

export default Card;

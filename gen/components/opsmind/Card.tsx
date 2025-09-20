import React from 'react';

// FIX: The Card component was not accepting a 'style' prop. The props interface has been extended with React.HTMLAttributes<HTMLDivElement> to allow passing 'style' and other standard div attributes.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className, ...rest }) => {
  return (
    <div
      className={`bg-brand-gray-900/50 p-4 rounded-lg border border-brand-gray-700 shadow-lg transition-all hover:border-brand-primary ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
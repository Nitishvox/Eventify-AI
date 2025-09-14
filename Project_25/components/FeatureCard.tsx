
import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-brand-gray-800 p-6 rounded-lg border border-brand-gray-700 transform transition-transform hover:scale-105 hover:border-brand-blue-500">
      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-brand-blue-500/20 text-brand-blue-400 mb-5">
        {icon}
      </div>
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <p className="text-brand-gray-200">{description}</p>
    </div>
  );
};

export default FeatureCard;

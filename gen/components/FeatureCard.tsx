
import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="relative bg-card p-6 rounded-lg border border-border overflow-hidden group transition-all duration-300 hover:border-primary">
        <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-30 transition-opacity duration-300" style={{ filter: 'blur(10px)' }}></div>
        <div className="relative">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/20 text-primary mb-5">
                {icon}
            </div>
            <h4 className="text-lg font-semibold mb-2 text-card-foreground">{title}</h4>
            <p className="text-muted-foreground">{description}</p>
        </div>
    </div>
  );
};

export default FeatureCard;
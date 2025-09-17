import React from 'react';
import { STAGES } from '../../constants/genesisConstants';

interface StageDisplayProps {
  currentStageIndex: number;
}

const StageDisplay: React.FC<StageDisplayProps> = ({ currentStageIndex }) => {
  return (
    <div className="glass-card rounded-xl p-4 shadow-lg">
      <ol className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-y-4 gap-x-2">
        {STAGES.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          
          let statusColor = 'text-gray-400 border-gray-700';
          if (isCurrent) {
            statusColor = 'text-indigo-300 border-indigo-500';
          } else if (isCompleted) {
            statusColor = 'text-green-400 border-green-500';
          }

          return (
            <li key={stage.title} className="flex flex-col items-center space-y-2 text-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${statusColor} transition-all duration-500`}>
                {isCompleted ? (
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                   </svg>
                ) : React.cloneElement(stage.icon, { className: 'w-6 h-6' })}
              </div>
              <p className={`text-xs font-medium ${isCurrent || isCompleted ? 'text-white' : 'text-gray-500'} transition-colors duration-500`}>
                {stage.title}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default StageDisplay;
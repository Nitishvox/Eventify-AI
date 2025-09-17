import React from 'react';
import type { OpsMindTimeline } from '../../types';
import Card from './Card';

interface TimelineArchitectProps {
  timeline: OpsMindTimeline;
}

const TimelineArchitect: React.FC<TimelineArchitectProps> = ({ timeline }) => {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card>
        <h4 className="font-semibold text-white">Strategic Summary</h4>
        <p className="text-sm text-brand-gray-300 mt-2">{timeline.summary}</p>
      </Card>
      <div>
        <h4 className="font-semibold text-white mb-2">Detailed Agenda</h4>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {timeline.agenda.map((item, index) => (
            <div key={index} className="flex items-start">
              <span className="bg-brand-gray-700 text-brand-gray-200 font-bold text-sm px-2 py-1 rounded-md mr-4 w-24 text-center flex-shrink-0">{item.time}</span>
              <div>
                <p className="font-semibold text-white">{item.title}</p>
                <p className="text-sm text-brand-gray-400">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineArchitect;
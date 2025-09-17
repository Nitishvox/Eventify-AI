import React, { useMemo } from 'react';
import type { Plan } from '../../types';

// Simple Markdown-to-JSX renderer to avoid using dangerouslySetInnerHTML
const SimpleMarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const renderedContent = useMemo(() => {
    return content.split('\n').map((line, index) => {
      // Headings
      if (line.startsWith('### ')) return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.substring(4)}</h3>;
      if (line.startsWith('## ')) return <h2 key={index} className="text-xl font-bold mt-6 mb-3">{line.substring(3)}</h2>;
      if (line.startsWith('# ')) return <h1 key={index} className="text-2xl font-extrabold mt-8 mb-4">{line.substring(2)}</h1>;
      
      // List items
      if (line.startsWith('- ')) return <li key={index} className="ml-6 list-disc">{line.substring(2)}</li>;
      
      // Separator
      if (line.trim() === '---') return <hr key={index} className="my-6 border-gray-700" />;
      
      // Empty line for spacing
      if (line.trim() === '') return <div key={index} className="h-4" />;

      // Paragraphs with inline bolding
      const parts = line.split(/(\*\*.*?\*\*)/g).filter(Boolean);
      return (
        <p key={index} className="my-2 leading-relaxed">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  }, [content]);

  return <div className="prose prose-invert prose-p:text-gray-300 prose-strong:text-white prose-headings:text-indigo-300">{renderedContent}</div>;
};

interface PlanCardProps {
  plan: Plan;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  return (
    <div className="glass-card rounded-xl shadow-lg animate-fade-in">
      <div className="p-6">
        <div className="flex items-center gap-x-4 mb-4">
          <div className="text-indigo-400">{plan.icon}</div>
          <h2 className="text-2xl font-bold text-white">{plan.title}</h2>
        </div>
        <div className="text-gray-300">
          <SimpleMarkdownRenderer content={plan.content} />
        </div>
      </div>
    </div>
  );
};

export default PlanCard;
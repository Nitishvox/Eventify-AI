import React, { useMemo, useState, useRef, useEffect } from 'react';
import type { Plan } from '../../types';
import Spinner from '../Spinner';
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import saveAs from "file-saver";


// Simple Markdown-to-JSX renderer to avoid using dangerouslySetInnerHTML
const SimpleMarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const renderedContent = useMemo(() => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('### ')) return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.substring(4)}</h3>;
      if (line.startsWith('## ')) return <h2 key={index} className="text-xl font-bold mt-6 mb-3 border-b border-gray-700 pb-2">{line.substring(3)}</h2>;
      if (line.startsWith('# ')) return <h1 key={index} className="text-2xl font-extrabold mt-8 mb-4">{line.substring(2)}</h1>;
      if (line.startsWith('- ')) return <li key={index} className="ml-6 list-disc">{line.substring(2)}</li>;
      if (line.trim() === '---') return <hr key={index} className="my-6 border-gray-700" />;
      if (line.trim() === '') return <div key={index} className="h-4" />;

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


interface FinalPlanDisplayProps {
  plan: Plan;
  onReset: () => void;
  onSave: () => void;
  isSaving: boolean;
}

const FinalPlanDisplay: React.FC<FinalPlanDisplayProps> = ({ plan, onReset, onSave, isSaving }) => {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
        setIsDownloadOpen(false);
      }
    };
    if (isDownloadOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDownloadOpen]);
  
  const handleDownloadPdf = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let currentY = 20;

    const lines = plan.content.split('\n');

    lines.forEach(line => {
        if (currentY > 270) {
            doc.addPage();
            currentY = 20;
        }

        if (line.startsWith('## ')) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.text(line.substring(3), margin, currentY);
            currentY += 10;
        } else if (line.startsWith('### ')) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text(line.substring(4), margin, currentY);
            currentY += 8;
        } else if (line.startsWith('- ')) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.text(`• ${line.substring(2)}`, margin + 5, currentY);
            currentY += 6;
        } else if (line.trim() !== '') {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            const splitText = doc.splitTextToSize(line, pageWidth - (margin * 2));
            doc.text(splitText, margin, currentY);
            currentY += (splitText.length * 5) + 2;
        } else {
            currentY += 4;
        }
    });

    doc.save(`${plan.title.replace(/\s/g, '_')}.pdf`);
    setIsDownloading(false);
    setIsDownloadOpen(false);
  };
  
  const handleDownloadWord = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    const children: (Paragraph)[] = [];
    const lines = plan.content.split('\n');

    lines.forEach(line => {
        if (line.startsWith('## ')) {
            children.push(new Paragraph({ text: line.substring(3), heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
        } else if (line.startsWith('### ')) {
            children.push(new Paragraph({ text: line.substring(4), heading: HeadingLevel.HEADING_3, spacing: { before: 150, after: 80 } }));
        } else if (line.startsWith('- ')) {
            children.push(new Paragraph({ text: line.substring(2), bullet: { level: 0 } }));
        } else if (line.trim() !== '') {
            children.push(new Paragraph({ children: [new TextRun(line)] }));
        }
    });
    
    const doc = new Document({
        sections: [{ properties: {}, children: children }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${plan.title.replace(/\s/g, '_')}.docx`);
    setIsDownloading(false);
    setIsDownloadOpen(false);
  };

  return (
    <div className="glass-card rounded-xl shadow-2xl p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-gray-700 pb-4">
        <div className="flex items-center gap-x-4">
          <div className="text-green-400">{plan.icon}</div>
          <h2 className="text-3xl font-bold text-white">{plan.title}</h2>
        </div>
        <div className="flex items-center gap-x-2 flex-shrink-0">
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-x-2 rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 transition-colors"
          >
            Start Over
          </button>
          <div className="relative" ref={downloadRef}>
            <button
              onClick={() => setIsDownloadOpen(!isDownloadOpen)}
              disabled={isDownloading}
              className="flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-all"
            >
              {isDownloading ? <Spinner size="sm" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
              <span>Download</span>
            </button>
            {isDownloadOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in">
                <div className="py-1">
                  <button onClick={handleDownloadPdf} className="w-full text-left flex items-center gap-x-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600">as PDF</button>
                  <button onClick={handleDownloadWord} className="w-full text-left flex items-center gap-x-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600">as Word (.docx)</button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 disabled:bg-gray-600 transition-colors"
          >
            {isSaving ? <Spinner size="sm" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V4zm11.707 2.707a1 1 0 00-1.414-1.414L14 6.586V4a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3z" /></svg>}
            <span>{isSaving ? 'Saving...' : 'Save to Dashboard'}</span>
          </button>
        </div>
      </div>
      <div className="text-gray-300 max-h-[60vh] overflow-y-auto pr-2">
         <SimpleMarkdownRenderer content={plan.content} />
      </div>
    </div>
  );
};

export default FinalPlanDisplay;

import React, { useState, useRef, useEffect } from 'react';
import type { SavedEvent } from '../types';
import { ICONS } from '../constants';
import Spinner from './Spinner';

// Document generation libraries
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun } from "docx";
import saveAs from "file-saver";


interface ViewPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedEvent: SavedEvent | null;
}

const ViewPlanModal: React.FC<ViewPlanModalProps> = ({ isOpen, onClose, savedEvent }) => {
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


  if (!isOpen || !savedEvent) return null;

  const { plan } = savedEvent;

  const handleDownloadPdf = async () => {
    if (!savedEvent) return;
    setIsDownloading(true);
    const { plan, cardImageUrl } = savedEvent;
    
    // Dynamically import to keep initial bundle small, though with import maps it's less critical
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    // 1. Add Image
    if (cardImageUrl) {
        try {
            if (cardImageUrl.startsWith('data:image')) {
                 const imgWidth = pageWidth - (margin * 2);
                 const imgHeight = (imgWidth / 16) * 9; // Maintain 16:9 aspect ratio
                 doc.addImage(cardImageUrl, 'JPEG', margin, 10, imgWidth, imgHeight);
            }
        } catch (e) { console.error("Error adding image to PDF", e); }
    }
    
    let currentY = 115;
    
    // 2. Add Content
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(plan.eventName, margin, currentY);
    currentY += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Theme: ${plan.theme}`, margin, currentY);
    currentY += 10;
    
    const splitDescription = doc.splitTextToSize(plan.description, pageWidth - (margin * 2));
    doc.text(splitDescription, margin, currentY);
    currentY += (splitDescription.length * 5) + 10;

    // 3. Venue
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Venue Details', margin, currentY);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
    currentY += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text(`Name: ${plan.venue.name}`, margin + 5, currentY);
    currentY += 7;
    doc.text(`Address: ${plan.venue.address}`, margin + 5, currentY);
    currentY += 10;

    // 4. Agenda
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Agenda', margin, currentY);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
    currentY += 10;
    
    plan.agenda.forEach(item => {
        if (currentY > 270) {
            doc.addPage();
            currentY = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(50);
        doc.text(`${item.time} — ${item.title}`, margin + 5, currentY);
        currentY+= 6;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100);
        const splitItemDesc = doc.splitTextToSize(item.description, pageWidth - (margin * 2) - 10);
        doc.text(splitItemDesc, margin + 10, currentY);
        currentY += (splitItemDesc.length * 5) + 5;
    });

    doc.save(`${plan.eventName.replace(/\s/g, '_')}.pdf`);
    setIsDownloading(false);
    setIsDownloadOpen(false);
  };

  const handleDownloadWord = async () => {
    if (!savedEvent) return;
    setIsDownloading(true);
    const { plan, cardImageUrl } = savedEvent;

    let imageBuffer: ArrayBuffer | undefined = undefined;
    if (cardImageUrl) {
        try {
            const response = await fetch(cardImageUrl);
            imageBuffer = await response.arrayBuffer();
        } catch (e) { console.error("Could not fetch image for docx", e); }
    }
    
    const children = [];
    
    if(imageBuffer) {
        children.push(new Paragraph({
            children: [ new ImageRun({
                data: imageBuffer,
                transformation: { width: 600, height: 337.5 } // 16:9 aspect ratio
            })]
        }));
    }
    
    children.push(new Paragraph({
        children: [new TextRun({ text: plan.eventName, bold: true, size: 48 })],
        heading: HeadingLevel.TITLE,
        spacing: { after: 200 }
    }));
    
    children.push(new Paragraph({ children: [new TextRun({ text: `Theme: ${plan.theme}`, italics: true, size: 28 })] }));
    children.push(new Paragraph({ children: [new TextRun({ text: plan.description, size: 24 })], spacing: { after: 400 } }));
    
    children.push(new Paragraph({
        children: [new TextRun({ text: "Venue Details", bold: true, size: 36 })],
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 }
    }));
    children.push(new Paragraph({ children: [new TextRun({ text: `Name: ${plan.venue.name}` })]}));
    children.push(new Paragraph({ children: [new TextRun({ text: `Address: ${plan.venue.address}` })], spacing: { after: 400 } }));

    children.push(new Paragraph({
        children: [new TextRun({ text: "Agenda", bold: true, size: 36 })],
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 }
    }));

    plan.agenda.forEach(item => {
        children.push(new Paragraph({ children: [new TextRun({ text: `${item.time} — ${item.title}`, bold: true, size: 24 })]}));
        children.push(new Paragraph({ children: [new TextRun({ text: item.description, italics: true, size: 22 })], spacing: { after: 200 } }));
    });
    
    const doc = new Document({
        sections: [{ properties: {}, children: children }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${plan.eventName.replace(/\s/g, '_')}.docx`);
    setIsDownloading(false);
    setIsDownloadOpen(false);
  };

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in-backdrop"
        onClick={onClose}
    >
      <div 
        className="bg-brand-gray-800 border border-brand-gray-700 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brand-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">{plan.eventName}</h2>
          <button onClick={onClose} className="text-brand-gray-300 hover:text-white transition-colors">{ICONS.X}</button>
        </div>
        
        {/* Content */}
        <div className="flex-grow p-6 overflow-y-auto">
            <p className="text-brand-gray-300 mb-4">{plan.description}</p>
            <div className="flex items-center text-sm text-brand-purple-300 bg-brand-purple-500/20 px-3 py-1 rounded-full w-fit mb-6">
                {React.cloneElement(ICONS.EMOJI_HAPPY, { className: 'w-5 h-5'})}
                <span className="ml-2 font-semibold">Theme: {plan.theme}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold mb-4 border-b border-brand-gray-600 pb-2">Venue Details</h3>
                    {plan.venue ? (
                        <div className="space-y-3 text-sm">
                            <p><strong className="font-semibold text-brand-gray-200">Name:</strong> {plan.venue.name}</p>
                            <p><strong className="font-semibold text-brand-gray-200">Address:</strong> {plan.venue.address}</p>
                            <p><strong className="font-semibold text-brand-gray-200">Description:</strong> {plan.venue.description}</p>
                            {plan.venue.website && (
                                <a href={plan.venue.website} target="_blank" rel="noopener noreferrer" className="text-brand-blue-400 hover:underline flex items-center space-x-1">
                                <span>Visit Website</span>
                                {React.cloneElement(ICONS.ATTRIBUTION, { className: 'w-4 h-4' })}
                                </a>
                            )}
                        </div>
                    ) : <p className="text-sm text-brand-gray-400">No venue details available.</p>}
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4 border-b border-brand-gray-600 pb-2">Agenda</h3>
                    {plan.agenda && plan.agenda.length > 0 ? (
                        <ul className="space-y-4">
                            {plan.agenda.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="bg-brand-gray-700 text-brand-gray-200 font-bold text-sm px-2 py-1 rounded-md mr-4 w-20 text-center flex-shrink-0">{item.time}</span>
                                    <div>
                                        <p className="font-semibold">{item.title}</p>
                                        <p className="text-sm text-brand-gray-300">{item.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-brand-gray-400">No agenda items available.</p>}
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-brand-gray-700 flex-shrink-0 flex justify-between items-center">
            <button onClick={onClose} className="text-sm font-medium text-brand-gray-300 hover:text-white transition">Close</button>
            <div className="relative" ref={downloadRef}>
                <button 
                    onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                    disabled={isDownloading}
                    className="flex items-center justify-center space-x-2 bg-brand-blue-500 hover:bg-brand-blue-400 disabled:bg-brand-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
                >
                    {isDownloading ? <Spinner size="sm" /> : React.cloneElement(ICONS.DOWNLOAD, { className: "w-5 h-5" })}
                    <span>{isDownloading ? 'Generating...' : 'Download Plan'}</span>
                    {React.cloneElement(ICONS.CHEVRON_DOWN, { className: `w-4 h-4 ml-1 transition-transform ${isDownloadOpen ? 'rotate-180' : ''}`})}
                </button>
                {isDownloadOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-brand-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in">
                        <div className="py-1">
                            <button onClick={handleDownloadPdf} className="w-full text-left px-4 py-2 text-sm text-brand-gray-200 hover:bg-brand-gray-600">as PDF</button>
                            <button onClick={handleDownloadWord} className="w-full text-left px-4 py-2 text-sm text-brand-gray-200 hover:bg-brand-gray-600">as Word (.docx)</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPlanModal;
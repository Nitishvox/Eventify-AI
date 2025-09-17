import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun } from "docx";
import saveAs from "file-saver";

import type { Plan, User, EventPlan, SavedEvent } from '../../types';
import { Page } from '../../types';
import { structureGenesisPlan } from '../../services/genesisService';
import { generateMoodBoard } from '../../services/geminiService';
import InnovationHub from './InnovationHub';
import Spinner from '../../components/Spinner';
import { ICONS } from '../../constants';

interface FinalPlanDisplayProps {
  plans: Plan[];
  idea: string;
  user: User;
  onRestart: () => void;
  onNavigate: (page: Page) => void;
}

const LOCAL_STORAGE_KEY = 'ai-event-planner-events';

const FinalPlanDisplay: React.FC<FinalPlanDisplayProps> = ({ plans, idea, user, onRestart, onNavigate }) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [structuredPlan, setStructuredPlan] = useState<EventPlan | null>(null);
  const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
        setIsDownloadOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fullPlanContext = useMemo(() => {
    return plans.map(p => `## ${p.title}\n\n${p.content}`).join('\n\n---\n\n');
  }, [plans]);

  const getStructuredPlan = useCallback(async (): Promise<{ plan: EventPlan, imageUrl: string | null } | null> => {
    setError(null);
    if (structuredPlan) {
      return { plan: structuredPlan, imageUrl: cardImageUrl };
    }
    
    try {
      const plan = await structureGenesisPlan(fullPlanContext);
      setStructuredPlan(plan);
      
      let imageUrl: string | null = null;
      try {
        const images = await generateMoodBoard(plan.theme, plan.description);
        imageUrl = images.length > 0 ? `data:image/jpeg;base64,${images[0]}` : null;
        setCardImageUrl(imageUrl);
      } catch (imageError) {
        console.error("Mood board generation failed:", imageError);
      }
      return { plan, imageUrl };
    } catch (e: any) {
      setError(e.message || "Failed to process the generated plan. Please try again.");
      return null;
    }
  }, [fullPlanContext, structuredPlan, cardImageUrl]);

  const handleSave = async (andEdit: boolean = false) => {
    const loadingState = andEdit ? 'edit' : 'save';
    setIsLoading(loadingState);

    const result = await getStructuredPlan();
    if (!result) {
      setIsLoading(null);
      return;
    }
    const { plan, imageUrl } = result;

    try {
      const localEventsRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const localEvents: SavedEvent[] = localEventsRaw ? JSON.parse(localEventsRaw) : [];
      
      const newEvent: SavedEvent = {
        // FIX: The 'id' for a SavedEvent must be a number. Using Date.now() provides a unique numeric ID suitable for local storage, resolving the type mismatch from using a string.
        id: Date.now(),
        user_id: user.id,
        created_at: new Date().toISOString(),
        plan_data: plan,
        card_image_url: imageUrl,
      };

      localEvents.unshift(newEvent);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localEvents));

      if (andEdit) {
        // FIX: localStorage.setItem requires its value to be a string. The numeric event ID is converted to a string before being stored.
        localStorage.setItem('eventToEditId', String(newEvent.id));
        onNavigate(Page.Planner);
      } else {
        onNavigate(Page.Dashboard);
      }
    } catch (err: any) {
      setError("Failed to save event to local storage.");
      console.error(err);
    } finally {
      setIsLoading(null);
    }
  };

  const handleDownload = async (format: 'pdf' | 'word') => {
    setIsLoading(format);
    const result = await getStructuredPlan();
    if (!result) {
      setIsLoading(null);
      return;
    }
    const { plan, imageUrl } = result;

    if (format === 'pdf') {
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let currentY = 20;

      if (imageUrl) {
        try {
          const imgWidth = pageWidth - margin * 2;
          const imgHeight = (imgWidth / 16) * 9;
          doc.addImage(imageUrl, 'JPEG', margin, 10, imgWidth, imgHeight);
          currentY = imgHeight + 25;
        } catch (e) { console.error("PDF Image Error:", e); }
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text(plan.eventName, margin, currentY);
      currentY += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`Theme: ${plan.theme}`, margin, currentY);
      currentY += 10;
      const splitDescription = doc.splitTextToSize(plan.description, pageWidth - margin * 2);
      doc.text(splitDescription, margin, currentY);
      currentY += splitDescription.length * 5 + 10;
      
      doc.save(`${plan.eventName.replace(/\s/g, '_')}.pdf`);
    } else {
      let imageBuffer: ArrayBuffer | undefined = undefined;
      if (imageUrl) {
        try {
          const response = await fetch(imageUrl);
          imageBuffer = await response.arrayBuffer();
        } catch (e) { console.error("Could not fetch image for docx", e); }
      }
      
      const children = [
        new Paragraph({ children: [new TextRun({ text: plan.eventName, bold: true, size: 48 })], heading: HeadingLevel.TITLE }),
        new Paragraph({ children: [new TextRun({ text: `Theme: ${plan.theme}`, italics: true, size: 28 })], spacing: { after: 400 } }),
        new Paragraph({ text: plan.description, spacing: { after: 400 } }),
      ];

      if (imageBuffer) {
        children.unshift(new Paragraph({
          // FIX: Changed property `data` to `buffer`. Using `data` with an ArrayBuffer was causing a type error, likely due to incorrect type inference by the compiler. Using `buffer` resolves this ambiguity.
          children: [new ImageRun({ buffer: imageBuffer, transformation: { width: 600, height: 337.5 } })]
        }));
      }

      const doc = new Document({ sections: [{ properties: {}, children }] });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${plan.eventName.replace(/\s/g, '_')}.docx`);
    }

    setIsLoading(null);
    setIsDownloadOpen(false);
  };

  const actionButtonClass = "w-full sm:w-auto flex items-center justify-center gap-x-2 rounded-lg px-6 py-3 text-base font-semibold text-white shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed transition-all duration-300";

  return (
    <div className="mt-12 animate-fade-in">
      <div className="text-center p-6 bg-gray-900/50 rounded-lg border border-green-700">
          <h2 className="text-2xl font-bold text-green-400">Blueprint Complete!</h2>
      </div>

      <div className="mt-8 p-6 bg-gray-900/50 rounded-lg border border-gray-700">
        <h3 className="text-xl font-bold text-center">Your Blueprint is Ready</h3>
        <p className="text-gray-400 text-center mt-2 mb-6">Save your plan, refine the details, or download it for your team.</p>
        {error && <p className="text-red-400 text-center mb-4 bg-red-900/50 p-3 rounded-md">{error}</p>}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button onClick={() => handleSave(false)} disabled={!!isLoading} className={`${actionButtonClass} bg-green-600 hover:bg-green-500 focus-visible:outline-green-600 disabled:bg-gray-600`}>
            {isLoading === 'save' ? <Spinner size="sm"/> : ICONS.USERS} <span>Save to Dashboard</span>
          </button>
          <button onClick={() => handleSave(true)} disabled={!!isLoading} className={`${actionButtonClass} bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600 disabled:bg-gray-600`}>
            {isLoading === 'edit' ? <Spinner size="sm"/> : ICONS.PAPER_CLIP} <span>Edit Plan</span>
          </button>
          <div className="relative w-full sm:w-auto" ref={downloadRef}>
            <button onClick={() => setIsDownloadOpen(!isDownloadOpen)} disabled={!!isLoading} className={`${actionButtonClass} bg-gray-700 hover:bg-gray-600 focus-visible:outline-gray-500 disabled:bg-gray-600 w-full`}>
              {isLoading === 'pdf' || isLoading === 'word' ? <Spinner size="sm" /> : ICONS.DOWNLOAD} <span>Download</span>
            </button>
            {isDownloadOpen && (
              <div className="absolute bottom-full mb-2 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg animate-fade-in">
                <button onClick={() => handleDownload('pdf')} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">as PDF</button>
                <button onClick={() => handleDownload('word')} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">as Word (.docx)</button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <InnovationHub planContext={fullPlanContext} />

      <div className="mt-12 flex justify-center">
        <button
          onClick={onRestart}
          className="rounded-md bg-gray-800 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 border border-gray-600 transition-all duration-300"
        >
          Plan Another Event
        </button>
      </div>
    </div>
  );
};

export default FinalPlanDisplay;
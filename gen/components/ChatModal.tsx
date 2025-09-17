import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, EventPlan } from '../types';
import { refineEventPlan, chatWithAgent } from '../services/geminiService';
import { ICONS } from '../constants';
import Spinner from './Spinner';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventPlan: EventPlan;
  onPlanUpdate: (newEventPlan: EventPlan) => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, eventPlan, onPlanUpdate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
        // Reset messages when modal opens, except for an initial greeting
        setMessages([{ role: 'model', text: "I'm ready to help! What would you like to change or add to the plan?" }]);
        setUserInput('');
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: userInput };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    const textToProcess = userInput;
    setUserInput('');
    setIsLoading(true);

    try {
        const agentResponse = await chatWithAgent(eventPlan, messages, textToProcess);
        
        const modelMessage: ChatMessage = {
            role: 'model',
            text: agentResponse.responseText,
        };

        if (agentResponse.actionableRequestIdentified) {
            modelMessage.pendingRequest = agentResponse.originalUserPrompt || textToProcess;
        }

        setMessages([...currentMessages, modelMessage]);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Sorry, I couldn't process that request.";
        setMessages([...currentMessages, { role: 'model', text: errorMessage }]);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleConfirmRefine = async (request: string) => {
    if (isLoading) return;

    // Remove the confirmation button from the message before proceeding
    const updatedMessages = messages.map(msg => {
        if (msg.pendingRequest === request) {
            const { pendingRequest, ...rest } = msg;
            return rest;
        }
        return msg;
    });

    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const updatedPlan = await refineEventPlan(eventPlan, request);
      onPlanUpdate(updatedPlan);
      
      const successMessage: ChatMessage = { role: 'model', text: "Excellent! I've updated the plan with your changes. Is there anything else I can help you with?" };
      setMessages([...updatedMessages, successMessage]);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sorry, I couldn't process that request.";
      setMessages([...updatedMessages, { role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in-backdrop"
        onClick={onClose}
    >
      <div 
        className="glass-card rounded-2xl shadow-2xl w-full max-w-lg flex flex-col h-[70vh] animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center space-x-3">
            {React.cloneElement(ICONS.SPARKLES, { className: "w-6 h-6 text-secondary" })}
            <h2 className="text-lg font-bold text-foreground">Refine with AI</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">{ICONS.X}</button>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center flex-shrink-0">
                  {React.cloneElement(ICONS.SPARKLES, { className: 'w-5 h-5 text-secondary' })}
                </div>
              )}
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-lg' : 'bg-accent text-accent-foreground rounded-bl-lg'}`}>
                    <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                </div>
                {msg.pendingRequest && !isLoading && (
                    <div className="mt-2">
                        <button 
                            onClick={() => handleConfirmRefine(msg.pendingRequest!)}
                            className="flex items-center space-x-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-2 px-3 rounded-lg text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            {React.cloneElement(ICONS.SPARKLES, {className: "w-4 h-4"})}
                            <span>Yes, Enhance Plan</span>
                        </button>
                    </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center flex-shrink-0">
                    {React.cloneElement(ICONS.SPARKLES, { className: 'w-5 h-5 text-secondary' })}
                </div>
                <div className="max-w-xs md:max-w-md px-4 py-2 rounded-2xl bg-accent text-accent-foreground rounded-bl-lg">
                    <Spinner size="sm"/>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="e.g., Change the theme to rustic..."
              className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !userInput.trim()}
              className="bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground font-bold p-2.5 rounded-lg transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
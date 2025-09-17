import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, CommunityPost, User } from '../types';
import { runGenesisAgent } from '../services/genesisAgentService';
import { ICONS } from '../constants';
import Spinner from './Spinner';

interface ChatSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: CommunityPost | null;
  user: User;
}

const ChatSimulationModal: React.FC<ChatSimulationModalProps> = ({ isOpen, onClose, post, user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && post) {
      setMessages([{ role: 'model', text: `Hi ${user.name}, I'm ${post.author.name}. Happy to chat about the ${post.plan.eventName} plan. What's on your mind?` }]);
      setUserInput('');
      setError(null);
    }
  }, [isOpen, post, user.name]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading || !post) return;

    const userMessage: ChatMessage = { role: 'user', text: userInput };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    const textToProcess = userInput;
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const fullPlanContext = `Event: ${post.plan.eventName}\nTheme: ${post.plan.theme}\nDescription: ${post.plan.description}\nAgenda: ${JSON.stringify(post.plan.agenda)}`;
      const agentResponse = await runGenesisAgent(textToProcess, fullPlanContext);
      
      const modelMessage: ChatMessage = {
          role: 'model',
          text: agentResponse,
      };

      setMessages([...currentMessages, modelMessage]);

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Sorry, I couldn't process that request.";
        setError(errorMessage);
        setMessages([...currentMessages, { role: 'model', text: `Sorry, I ran into an error. Please try again. (${errorMessage})` }]);
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen || !post) return null;

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
            <img src={post.author.avatarUrl} alt={post.author.name} className="w-10 h-10 rounded-full" />
            <div>
                <h2 className="text-lg font-bold text-foreground">Chat with {post.author.name}</h2>
                <p className="text-sm text-muted-foreground">{post.author.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">{ICONS.X}</button>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && (
                <img src={post.author.avatarUrl} alt={post.author.name} className="w-8 h-8 rounded-full flex-shrink-0" />
              )}
              <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-lg' : 'bg-accent text-accent-foreground rounded-bl-lg'}`}>
                  <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
                 <img src={post.author.avatarUrl} alt={post.author.name} className="w-8 h-8 rounded-full flex-shrink-0" />
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
              placeholder="Ask about this plan..."
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

export default ChatSimulationModal;

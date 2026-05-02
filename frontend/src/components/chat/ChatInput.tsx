"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';
import { useCreditStore } from '@/store/creditStore';
import { estimateCredits } from '@/lib/creditFormula';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number>(0.5);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { plan, modelMultiplier, credits } = useCreditStore();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
    
    if (input.trim()) {
      setEstimatedCost(estimateCredits(input, plan, modelMultiplier));
    } else {
      setEstimatedCost(0);
    }
  }, [input, plan, modelMultiplier]);

  const handleSend = () => {
    if (!input.trim() || isLoading || credits <= 0) return;
    onSend(input.trim());
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center">
      {input.trim().length > 0 && (
        <div className="w-full mb-2 flex justify-between px-2 text-xs font-mono">
          <span className="text-text3 flex items-center gap-1"><CornerDownLeft size={12}/> Send</span>
          <span className="text-amber">~{estimatedCost.toFixed(3)} credits estimated</span>
        </div>
      )}
      
      <div className="relative w-full bg-bg2 border border-border2 focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/50 rounded-2xl shadow-lg flex items-end p-2 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message EXAMPLE.ai..."
          disabled={isLoading || credits <= 0}
          className="flex-1 max-h-[120px] bg-transparent resize-none outline-none text-text1 px-3 py-2 text-base placeholder:text-text3 disabled:opacity-50"
          rows={1}
        />
        
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading || credits <= 0}
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-accent text-white hover:bg-accent2 disabled:bg-bg3 disabled:text-text3 transition-colors ml-2"
        >
          <Send size={18} />
        </button>
      </div>
      
      {credits <= 0 && (
        <div className="text-red text-xs mt-2 font-medium">
          Insufficient credits. Please upgrade your plan.
        </div>
      )}
    </div>
  );
}

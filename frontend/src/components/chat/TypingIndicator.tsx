"use client";

import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 w-full max-w-4xl mx-auto"
    >
      <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-sm border bg-bg3 border-border2 text-text2">
        <Bot size={18} />
      </div>
      
      <div className="flex flex-col gap-1 items-start">
        <div className="px-5 py-4 rounded-2xl shadow-sm bg-bg2 border border-border2 text-text1 rounded-tl-sm flex items-center gap-1.5 h-[50px]">
          <div className="w-2 h-2 rounded-full bg-accent" style={{ animation: 'typing 1.4s infinite 0s' }} />
          <div className="w-2 h-2 rounded-full bg-accent" style={{ animation: 'typing 1.4s infinite 0.2s' }} />
          <div className="w-2 h-2 rounded-full bg-accent" style={{ animation: 'typing 1.4s infinite 0.4s' }} />
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import { Message } from '@/store/chatStore';
import { Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 w-full max-w-4xl mx-auto ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-sm border
        ${isUser ? 'bg-gradient-to-tr from-accent to-accent2 border-accent/20 text-white' : 'bg-bg3 border-border2 text-text2'}
      `}>
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>
      
      <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed
          ${isUser ? 'bg-accent text-white rounded-tr-sm' : 'bg-bg2 border border-border2 text-text1 rounded-tl-sm'}
        `}>
          {message.content.split('\n').map((line, i) => (
            <p key={i} className="min-h-[1em] whitespace-pre-wrap">{line}</p>
          ))}
        </div>
        
        {message.usage && (
          <div className="mt-1 flex gap-2 items-center text-[11px] font-mono text-text3 bg-bg2 border border-border2 px-2 py-1 rounded-md">
            <span>In: {message.usage.inputTokens}</span>
            <span>Out: {message.usage.outputTokens}</span>
            <span className="text-red/80 font-semibold border-l border-border2 pl-2">-{message.usage.cost.toFixed(3)} cr</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

"use client";

import { useCreditStore } from '@/store/creditStore';
import { useChatStore } from '@/store/chatStore';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MessageSquare, Plus, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const MODELS = [
  { id: 'gemini', name: 'Gemini Flash', multiplier: 1, proOnly: false },
  { id: 'gpt', name: 'GPT-4o', multiplier: 1.5, proOnly: true },
  { id: 'claude', name: 'Claude 3.5 Sonnet', multiplier: 2, proOnly: true },
];

export default function Sidebar() {
  const { plan, credits, maxCredits, model, setModel } = useCreditStore();
  const { conversations, activeConversationId, setActiveConversation, newConversation } = useChatStore();

  const creditPercentage = Math.min(100, Math.max(0, (credits / maxCredits) * 100));
  const progressColor = creditPercentage > 50 ? 'bg-green' : creditPercentage > 20 ? 'bg-amber' : 'bg-red';

  return (
    <div className="w-[260px] h-full bg-bg2 border-r border-border flex flex-col shrink-0">
      <div className="p-4 border-b border-border">
        <Button onClick={newConversation} variant="outline" className="w-full flex justify-between items-center text-text1">
          <span>New Chat</span>
          <Plus size={16} />
        </Button>
      </div>

      <div className="p-4 border-b border-border flex flex-col gap-2">
        <label className="text-xs font-semibold text-text3 uppercase tracking-wider">Model Selection</label>
        <div className="flex flex-col gap-1">
          {MODELS.map((m) => {
            const isLocked = m.proOnly && plan !== 'PRO';
            return (
              <button
                key={m.id}
                onClick={() => {
                  if (!isLocked) setModel(m.id as any, m.multiplier);
                  else alert("Upgrade to PRO to use this model.");
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left
                  ${model === m.id ? 'bg-accent/10 text-accent font-medium' : 'text-text2 hover:bg-bg3 hover:text-text1'}
                  ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}
                `}
              >
                <span>{m.name}</span>
                {isLocked && <Lock size={14} className="text-text3" />}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="px-2 py-2 text-xs font-semibold text-text3 uppercase tracking-wider mb-1">Recent Chats</div>
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => setActiveConversation(conv.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left
              ${activeConversationId === conv.id ? 'bg-bg3 text-text1' : 'text-text2 hover:bg-bg3/50 hover:text-text1'}
            `}
          >
            <MessageSquare size={16} className={activeConversationId === conv.id ? 'text-accent' : ''} />
            <span className="truncate flex-1">{conv.title}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-border bg-bg3/30">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-text2">Credits</span>
          <span className="text-sm font-bold text-text1">{credits.toFixed(1)} / {maxCredits}</span>
        </div>
        <div className="w-full bg-bg4 h-2 rounded-full overflow-hidden mb-3">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${creditPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full rounded-full ${progressColor}`} 
          />
        </div>
        {plan === 'FREE' && (
          <a href="/pricing" className="text-xs text-accent hover:text-accent2 transition-colors font-medium">Upgrade for more limits</a>
        )}
      </div>
    </div>
  );
}

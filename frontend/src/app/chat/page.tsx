"use client";

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/chat/Sidebar';
import MessageBubble from '@/components/chat/MessageBubble';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ChatInput from '@/components/chat/ChatInput';
import { useChatStore } from '@/store/chatStore';
import { useCreditStore } from '@/store/creditStore';
import { useToastStore } from '@/store/toastStore';

export default function ChatPage() {
  const { status } = useSession();
  const router = useRouter();
  const { addToast } = useToastStore();
  
  const { conversations, activeConversationId, isTyping, setTyping, addMessage, updateMessage } = useChatStore();
  const { model, setCredits } = useCreditStore();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    }
  }, [status, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConversationId, isTyping]);

  const activeConv = conversations.find(c => c.id === activeConversationId);
  const messages = activeConv?.messages || [];

  const handleSendMessage = async (content: string) => {
    if (!activeConversationId) return;

    const userMessageId = Date.now().toString();
    addMessage(activeConversationId, { id: userMessageId, role: 'user', content });
    
    const assistantMessageId = (Date.now() + 1).toString();
    setTyping(true);
    addMessage(activeConversationId, { id: assistantMessageId, role: 'assistant', content: '' });

    try {
      const sessionResponse = await fetch('/api/auth/session');
      const sessionData = await sessionResponse.json();
      const token = sessionData?.accessToken || '';

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/chat/stream`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ message: content, model })
      });

      if (!response.ok) {
        if (response.status === 402 || response.status === 403) {
           addToast('Insufficient credits. Please upgrade.', 'error');
           setTyping(false);
           return;
        }
        throw new Error('Failed to generate response');
      }

      setTyping(false);
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));
                
                if (data.error) throw new Error(data.error);
                
                if (data.done && data.usage) {
                  updateMessage(activeConversationId, assistantMessageId, (msg) => ({ ...msg, usage: data.usage }));
                  setCredits(data.usage.remainingCredits);
                } else if (data.text) {
                  fullText += data.text;
                  updateMessage(activeConversationId, assistantMessageId, (msg) => ({ ...msg, content: fullText }));
                }
              } catch {
                // Ignore parse errors from incomplete chunks
              }
            }
          }
        }
      }
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addToast(errorMessage, 'error');
      setTyping(false);
      updateMessage(activeConversationId, assistantMessageId, (msg) => ({ ...msg, content: `Error: ${errorMessage}` }));
    }
  };

  if (status === 'loading') return null;

  return (
    <div className="flex h-full w-full overflow-hidden bg-bg">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-full relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-8 pb-32">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {isTyping && <TypingIndicator />}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-bg via-bg to-transparent">
          <ChatInput onSend={handleSendMessage} isLoading={isTyping} />
        </div>
      </div>
    </div>
  );
}

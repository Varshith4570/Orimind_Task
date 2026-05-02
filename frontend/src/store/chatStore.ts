import { create } from 'zustand';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  usage?: { inputTokens: number, outputTokens: number, cost: number, remainingCredits: number };
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
};

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isTyping: boolean;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updateFn: (msg: Message) => Message) => void;
  setTyping: (bool: boolean) => void;
  newConversation: () => void;
  setActiveConversation: (id: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [{ id: '1', title: 'New Chat', messages: [{ id: 'init', role: 'assistant', content: 'Hello! I am EXAMPLE.ai. How can I help you today?' }] }],
  activeConversationId: '1',
  isTyping: false,
  addMessage: (convId, message) => set((state) => ({
    conversations: state.conversations.map(c => 
      c.id === convId ? { ...c, messages: [...c.messages, message] } : c
    )
  })),
  updateMessage: (convId, msgId, updateFn) => set((state) => ({
    conversations: state.conversations.map(c => 
      c.id === convId ? { 
        ...c, 
        messages: c.messages.map(m => m.id === msgId ? updateFn(m) : m) 
      } : c
    )
  })),
  setTyping: (isTyping) => set({ isTyping }),
  newConversation: () => {
    const id = Date.now().toString();
    set((state) => ({
      conversations: [...state.conversations, { id, title: 'New Chat', messages: [] }],
      activeConversationId: id
    }));
  },
  setActiveConversation: (id) => set({ activeConversationId: id })
}));

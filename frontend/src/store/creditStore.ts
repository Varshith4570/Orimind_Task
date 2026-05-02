import { create } from 'zustand';

interface CreditState {
  credits: number;
  maxCredits: number;
  plan: 'FREE' | 'PRO';
  model: 'gemini' | 'gpt' | 'claude' | 'mixtral';
  modelMultiplier: number;
  requests: number;
  setCredits: (n: number) => void;
  deductCredits: (n: number) => void;
  setPlan: (p: 'FREE' | 'PRO') => void;
  setModel: (m: 'gemini' | 'gpt' | 'claude' | 'mixtral', multi: number) => void;
  setRequests: (n: number) => void;
}

export const useCreditStore = create<CreditState>((set) => ({
  credits: 10,
  maxCredits: 10,
  plan: 'FREE',
  model: 'gemini',
  modelMultiplier: 1,
  requests: 0,
  setCredits: (credits) => set({ credits }),
  deductCredits: (amount) => set((state) => ({ credits: Math.max(0, state.credits - amount) })),
  setPlan: (plan) => set({ plan, maxCredits: plan === 'PRO' ? 100 : 10 }),
  setModel: (model, modelMultiplier) => set({ model, modelMultiplier }),
  setRequests: (requests) => set({ requests })
}));

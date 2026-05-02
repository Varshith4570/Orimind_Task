"use client";

import { useToastStore } from '@/store/toastStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border backdrop-blur-md w-80 
              ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : ''}
              ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : ''}
              ${toast.type === 'info' ? 'bg-accent/10 border-accent/20 text-accent2' : ''}
            `}
          >
            {toast.type === 'success' && <CheckCircle size={20} />}
            {toast.type === 'error' && <AlertCircle size={20} />}
            {toast.type === 'info' && <Info size={20} />}
            
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-white/50 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

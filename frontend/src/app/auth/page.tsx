"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToastStore } from '@/store/toastStore';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { addToast } = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
        action: isLogin ? 'login' : 'register'
      });

      if (res?.error) {
        addToast(res.error, 'error');
      } else {
        addToast('Successfully authenticated!', 'success');
        router.push('/chat');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        addToast(err.message, 'error');
      } else {
        addToast('Authentication failed', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full flex items-center justify-center p-6 min-h-screen bg-bg relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan/10 rounded-full blur-[100px] pointer-events-none" />

      <Link href="/" className="absolute top-6 left-6 text-text2 hover:text-text1 flex items-center gap-2 transition-colors">
        <ArrowLeft size={16} /> Back to home
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-bg2 border border-border2 rounded-2xl shadow-2xl overflow-hidden relative z-10"
      >
        <div className="flex w-full border-b border-border">
          <button 
            className={`flex-1 py-4 text-sm font-medium transition-colors ${isLogin ? 'text-accent border-b-2 border-accent' : 'text-text2 hover:text-text1'}`}
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </button>
          <button 
            className={`flex-1 py-4 text-sm font-medium transition-colors ${!isLogin ? 'text-accent border-b-2 border-accent' : 'text-text2 hover:text-text1'}`}
            onClick={() => setIsLogin(false)}
          >
            Create Account
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text1 mb-2">
              {isLogin ? 'Welcome back' : 'Get started'}
            </h1>
            <p className="text-sm text-text3">
              {isLogin ? 'Enter your credentials to access your account' : 'Create a new account to start using EXAMPLE.ai'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Input 
                    label="Full Name" 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Input 
              label="Email Address" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required 
            />
            
            <Input 
              label="Password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
              minLength={6}
            />

            <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToastStore } from '@/store/toastStore';
import { api } from '@/lib/axios';

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handleUpgrade = async () => {
    if (status === 'unauthenticated') {
      router.push('/auth');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await api.post('/billing/create-order');
      const order = res.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_1234567890',
        amount: order.amount,
        currency: order.currency,
        name: 'EXAMPLE.ai',
        description: 'Pro Plan - 100 Credits/month',
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await api.post('/billing/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            if (verifyRes.status === 200 || verifyRes.status === 201) {
              addToast('Payment successful! You are now a PRO user.', 'success');
              router.push('/billing');
            }
          } catch (e: any) {
            addToast('Payment verification failed.', 'error');
          }
        },
        prefill: { email: session?.user?.email || '' },
        theme: { color: '#7c6af7' }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        addToast(response.error.description || 'Payment Failed', 'error');
        setIsLoading(false);
      });
      rzp.open();

    } catch (error) {
      console.error(error);
      addToast('Error initiating checkout', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-20 w-full">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Simple, transparent pricing</h1>
        <p className="text-lg text-text2 max-w-2xl mx-auto">
          Choose the plan that best fits your needs. Upgrade anytime to unlock advanced models.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* Free Plan */}
        <div className="bg-bg2 border border-border2 rounded-2xl p-8 flex flex-col hover:border-border transition-colors relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-border"></div>
          <h2 className="text-2xl font-bold mb-2">Free Plan</h2>
          <div className="text-5xl font-extrabold mb-2">₹0<span className="text-lg text-text3 font-normal">/month</span></div>
          <p className="text-text2 mb-8">Perfect for trying out the platform.</p>
          
          <ul className="flex-1 space-y-4 mb-8">
            <li className="flex items-center gap-3"><Check className="text-cyan w-5 h-5" /> 10 Free Credits</li>
            <li className="flex items-center gap-3"><Check className="text-cyan w-5 h-5" /> Gemini Flash only</li>
            <li className="flex items-center gap-3"><Check className="text-cyan w-5 h-5" /> Basic (concise) responses</li>
            <li className="flex items-center gap-3 text-text3"><X className="w-5 h-5" /> No advanced models</li>
          </ul>

          <Button variant="outline" className="w-full h-12" onClick={() => !session && router.push('/auth')}>
            {session ? 'Current Plan' : 'Get Started'}
          </Button>
        </div>

        {/* Pro Plan */}
        <div className="bg-bg2 border border-accent/50 rounded-2xl p-8 flex flex-col relative shadow-2xl shadow-accent/10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-accent2"></div>
          <div className="absolute -top-4 right-8">
            <Badge variant="pro" className="px-3 py-1 shadow-lg border-accent text-accent bg-bg font-bold flex items-center gap-1">
              <Zap className="w-3 h-3" /> MOST POPULAR
            </Badge>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Pro Plan</h2>
          <div className="text-5xl font-extrabold mb-2 text-gradient">₹1,417<span className="text-lg text-text3 font-normal">/month</span></div>
          <p className="text-text2 mb-8">For power users who need advanced capabilities.</p>
          
          <ul className="flex-1 space-y-4 mb-8">
            <li className="flex items-center gap-3"><Check className="text-accent w-5 h-5" /> 100 Included Credits</li>
            <li className="flex items-center gap-3"><Check className="text-accent w-5 h-5" /> All models: Gemini, GPT-4o, Claude 3.5</li>
            <li className="flex items-center gap-3"><Check className="text-accent w-5 h-5" /> Detailed pro responses</li>
            <li className="flex items-center gap-3"><Check className="text-accent w-5 h-5" /> Full transaction history</li>
          </ul>

          <Button 
            onClick={handleUpgrade}
            isLoading={isLoading}
            className="w-full h-12 flex items-center justify-center gap-2"
          >
            Upgrade with Razorpay
          </Button>
        </div>

      </div>
    </div>
  );
}

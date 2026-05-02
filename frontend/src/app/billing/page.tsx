"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, CreditCard, Activity, Box } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCreditStore } from '@/store/creditStore';
import { api } from '@/lib/axios';

export default function BillingPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { plan, credits, maxCredits, requests, setPlan, setCredits, setRequests } = useCreditStore();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
      return;
    }

    if (status === 'authenticated') {
      const fetchUserData = async () => {
        try {
          const res = await api.get('/auth/me');
          const userData = res.data;
          setPlan(userData.plan);
          setCredits(userData.totalCredits);
          setRequests(userData.requests || 0);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    }
  }, [status, router, setPlan, setCredits, setRequests]);

  if (loading || status === 'loading') {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-accent w-10 h-10" /></div>;
  }

  const creditsUsed = maxCredits - credits;
  const avgPerReq = requests > 0 ? (creditsUsed / requests).toFixed(2) : '0.00';

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 w-full">
      <h1 className="text-3xl font-bold mb-8 text-text1">Billing & Usage</h1>

      {/* Current Plan Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg2 border border-border2 rounded-xl p-6 mb-8 flex flex-col sm:flex-row justify-between items-center shadow-lg"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-bg3 rounded-full flex items-center justify-center border border-border">
            <Box className="text-text2" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-text2">Current Plan</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl font-bold text-text1">{plan === 'PRO' ? 'Pro Plan' : 'Free Plan'}</span>
              <Badge variant={plan === 'PRO' ? 'pro' : 'free'} className="uppercase">{plan}</Badge>
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-0">
          {plan === 'FREE' ? (
            <Button onClick={() => router.push('/pricing')}>Upgrade to PRO</Button>
          ) : (
            <Button variant="outline">Manage Plan</Button>
          )}
        </div>
      </motion.div>

      {/* Usage Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-bg2 border border-border2 rounded-xl p-6 flex flex-col shadow-sm"
        >
          <h3 className="text-text2 font-medium mb-2 text-sm flex items-center gap-2"><CreditCard size={16}/> Credits Left</h3>
          <div className="text-3xl font-bold text-text1">{credits.toFixed(1)}</div>
          <div className="w-full bg-bg3 h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className={`h-full rounded-full ${credits > maxCredits * 0.2 ? 'bg-green' : 'bg-red'}`} 
              style={{ width: `${Math.min(100, Math.max(0, (credits / maxCredits) * 100))}%` }}
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-bg2 border border-border2 rounded-xl p-6 flex flex-col shadow-sm"
        >
          <h3 className="text-text2 font-medium mb-2 text-sm flex items-center gap-2"><Activity size={16}/> Credits Used</h3>
          <div className="text-3xl font-bold text-text1">{Math.max(0, creditsUsed).toFixed(1)}</div>
          <div className="text-xs text-text3 mt-2">out of {maxCredits} max</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-bg2 border border-border2 rounded-xl p-6 flex flex-col shadow-sm"
        >
          <h3 className="text-text2 font-medium mb-2 text-sm">Total Requests</h3>
          <div className="text-3xl font-bold text-text1">{requests}</div>
          <div className="text-xs text-text3 mt-2">this billing cycle</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-bg2 border border-border2 rounded-xl p-6 flex flex-col shadow-sm"
        >
          <h3 className="text-text2 font-medium mb-2 text-sm">Avg Credits/Req</h3>
          <div className="text-3xl font-bold text-text1">{avgPerReq}</div>
          <div className="text-xs text-text3 mt-2">across all models</div>
        </motion.div>
      </div>

      <h2 className="text-xl font-bold mb-6 text-text1">Transaction History</h2>
      <div className="bg-bg2 border border-border2 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-border bg-bg3/50 text-xs uppercase tracking-wider text-text3">
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium">Description</th>
              <th className="px-6 py-4 font-medium">Model</th>
              <th className="px-6 py-4 font-medium">Tokens (In / Out)</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr className="border-b border-border2/50 hover:bg-bg3/30 transition-colors">
              <td className="px-6 py-4 text-text2">Just now</td>
              <td className="px-6 py-4 text-text1">Chat Inference</td>
              <td className="px-6 py-4"><Badge variant="default">GPT-4o</Badge></td>
              <td className="px-6 py-4 text-text2">120 / 450</td>
              <td className="px-6 py-4 text-red font-medium">-0.13 cr</td>
              <td className="px-6 py-4"><Badge variant="success">OK</Badge></td>
            </tr>
            <tr className="border-b border-border2/50 hover:bg-bg3/30 transition-colors">
              <td className="px-6 py-4 text-text2">2 hours ago</td>
              <td className="px-6 py-4 text-text1">Chat Inference</td>
              <td className="px-6 py-4"><Badge variant="default">Gemini Flash</Badge></td>
              <td className="px-6 py-4 text-text2">45 / 80</td>
              <td className="px-6 py-4 text-red font-medium">-0.10 cr</td>
              <td className="px-6 py-4"><Badge variant="success">OK</Badge></td>
            </tr>
            <tr className="hover:bg-bg3/30 transition-colors">
              <td className="px-6 py-4 text-text2">2 days ago</td>
              <td className="px-6 py-4 text-text1">Pro Plan Upgrade</td>
              <td className="px-6 py-4">-</td>
              <td className="px-6 py-4 text-text2">-</td>
              <td className="px-6 py-4 text-green font-medium">+100.00 cr</td>
              <td className="px-6 py-4"><Badge variant="success">OK</Badge></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

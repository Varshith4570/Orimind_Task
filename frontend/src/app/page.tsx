"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Database, Zap, Shield, Code, Server, CreditCard } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 w-full overflow-y-auto">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-20 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-accent/20 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-text1 leading-tight"
        >
          Intelligent AI access on a <span className="text-gradient">credit system</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-text2 max-w-2xl mx-auto mb-12"
        >
          Stop paying flat subscriptions for models you don&apos;t use. Access Gemini, GPT-4o, and Claude 3.5 Sonnet through a single platform. Pay only for the tokens you consume.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/auth">
            <Button className="h-14 px-8 text-lg font-bold w-full sm:w-auto">Get Started for Free</Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" className="h-14 px-8 text-lg font-bold w-full sm:w-auto">View Pricing</Button>
          </Link>
        </motion.div>
      </section>

      {/* Architecture Strip */}
      <section className="border-y border-border bg-bg2 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-semibold text-text3 mb-6 uppercase tracking-wider">Powered by modern architecture</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale">
            <span className="text-xl font-bold flex items-center gap-2"><Code size={24}/> Next.js 14</span>
            <span className="text-xl font-bold flex items-center gap-2"><Server size={24}/> NestJS</span>
            <span className="text-xl font-bold flex items-center gap-2"><Database size={24}/> PostgreSQL</span>
            <span className="text-xl font-bold flex items-center gap-2"><Zap size={24}/> Redis</span>
            <span className="text-xl font-bold flex items-center gap-2"><CreditCard size={24}/> Razorpay</span>
          </div>
        </div>
      </section>

      {/* Credit Formula */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold mb-8">Transparent Pricing Formula</h2>
        <div className="bg-[#1e1e2e] rounded-xl p-8 border border-[#313244] shadow-2xl text-left overflow-x-auto">
          <pre className="font-mono text-cyan-400 text-sm md:text-base">
            <code>
<span className="text-purple-400">const</span> calculateCredits = (input_tokens, output_tokens, model_multiplier) {`=>`} {'{\n'}
{'  '}<span className="text-gray-500">{"// 1M tokens = $1 input, $2 output baseline"}</span>
{'  '}<span className="text-purple-400">const</span> inputCost = input_tokens * <span className="text-amber-400">0.000001</span>;
{'  '}<span className="text-purple-400">const</span> outputCost = output_tokens * <span className="text-amber-400">0.000002</span>;
{'  '}
{'  '}<span className="text-purple-400">const</span> rawCredits = (inputCost + outputCost) * model_multiplier * <span className="text-amber-400">1000</span>;
{'  '}
{'  '}<span className="text-purple-400">return</span> <span className="text-blue-400">Math</span>.max(<span className="text-amber-400">0.5</span>, rawCredits); <span className="text-gray-500">{"// Minimum charge"}</span>
{'}'}
            </code>
          </pre>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold mb-16 text-center">Enterprise-Grade Infrastructure</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: 'Dynamic Credit Billing', desc: 'Real-time calculation of costs based on strict token usage from API responses.', icon: <Zap className="text-amber-400" /> },
            { title: 'Plan Enforcement', desc: 'Secure backend gates ensuring users stay within their allotted credit limits.', icon: <Shield className="text-green-400" /> },
            { title: 'Razorpay Integration', desc: 'Seamlessly upgrade to Pro with India&apos;s leading payment gateway via robust HMAC validation.', icon: <CreditCard className="text-purple-400" /> },
            { title: 'Prompt Engineering', desc: 'Optimized system prompts depending on plan tier (Concise vs Detailed).', icon: <Code className="text-cyan-400" /> },
            { title: 'Redis Caching', desc: 'High-performance rate limiting and session storage to prevent abuse.', icon: <Database className="text-red-400" /> },
            { title: 'Usage Analytics', desc: 'Track every single request, token count, and deducted credits in real-time.', icon: <Server className="text-pink-400" /> },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-bg2 border border-border2 p-6 rounded-xl hover:border-border transition-colors"
            >
              <div className="w-12 h-12 bg-bg3 rounded-lg flex items-center justify-center mb-4 border border-border">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-text2 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

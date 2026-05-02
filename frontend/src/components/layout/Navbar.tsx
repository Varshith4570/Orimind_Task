"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCreditStore } from '@/store/creditStore';
import { LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const { plan, credits } = useCreditStore();
  const pathname = usePathname();

  const isAuthPage = pathname === '/auth';

  if (isAuthPage) return null;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-bg/80 backdrop-blur-md h-16 flex items-center">
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-gradient">EXAMPLE.ai</span>
        </Link>

        {session ? (
          <div className="flex items-center gap-6">
            <Link href="/chat" className="text-sm font-medium text-text2 hover:text-text1 transition-colors">Chat</Link>
            <Link href="/billing" className="text-sm font-medium text-text2 hover:text-text1 transition-colors">Billing</Link>
            
            <div className="h-6 w-px bg-border mx-2"></div>
            
            <div className="flex items-center gap-3">
              <Badge variant={plan === 'PRO' ? 'pro' : 'free'} className="uppercase">
                {plan}
              </Badge>
              <Badge variant={credits > 20 ? 'success' : credits > 5 ? 'warning' : 'error'}>
                {credits.toFixed(1)} cr
              </Badge>
              <Button variant="ghost" className="p-2 h-9 w-9 rounded-full" onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm font-medium text-text2 hover:text-text1 transition-colors">Pricing</Link>
            <Link href="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

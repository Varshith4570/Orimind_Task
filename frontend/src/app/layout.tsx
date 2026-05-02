import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/layout/AuthProvider';
import Navbar from '@/components/layout/Navbar';
import Toaster from '@/components/ui/Toaster';

export const metadata: Metadata = {
  title: 'EXAMPLE.ai - Intelligent AI Access',
  description: 'Subscription-based multi-model AI SaaS platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col w-full h-[calc(100vh-64px)]">
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

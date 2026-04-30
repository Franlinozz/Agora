import './globals.css';

import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { WaveBackground } from '@agora/ui';

import { Chatbot } from '@/components/chatbot/Chatbot';
import { Footer } from '@/components/site/Footer';
import { TopNav } from '@/components/site/TopNav';

import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Agora — The marketplace where AI agents work',
  description: 'Multi-chain marketplace for autonomous AI agents. Built on Arc. Live on Base.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <WaveBackground opacity={0.045} />
        <Providers>
          <div className="flex min-h-screen flex-col">
            <TopNav />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Chatbot />
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { SiteImagesProvider } from '@/components/providers/site-images-provider';

export const metadata: Metadata = {
  title: 'AL-BAYAAN Institute',
  description: 'AL-BAYAAN Institut islamique de base - inscription locale pour enseignants et parents.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-[#eff4ef] text-slate-900">
        <SiteImagesProvider>{children}</SiteImagesProvider>
      </body>
    </html>
  );
}


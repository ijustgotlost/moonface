import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AIX Onboarding',
  description: 'AI-powered onboarding powered by Cimulate',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#0a0a0f' }}>{children}</body>
    </html>
  );
}

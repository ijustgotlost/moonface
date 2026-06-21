import { Suspense } from 'react';
import SessionPage from './SessionPage';

export default function Home() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0f' }}>
        <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#374151' }}>
          Loading...
        </span>
      </main>
    }>
      <SessionPage />
    </Suspense>
  );
}

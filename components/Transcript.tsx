'use client';

import { useEffect, useRef } from 'react';

export interface Turn {
  role: 'alex' | 'learner';
  text: string;
}

interface TranscriptProps {
  turns: Turn[];
}

export default function Transcript({ turns }: TranscriptProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);

  if (turns.length === 0) return null;

  return (
    <div className="w-full max-w-xl mx-auto max-h-64 overflow-y-auto px-4 space-y-3 scrollbar-thin">
      {turns.map((turn, i) => (
        <div
          key={i}
          className="animate-fadeIn"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <span className="text-xs uppercase tracking-widest mr-2 font-mono"
            style={{ color: turn.role === 'alex' ? '#6b7280' : '#9ca3af' }}>
            {turn.role === 'alex' ? 'Alex' : 'You'}
          </span>
          <span
            className="font-mono text-sm leading-relaxed"
            style={{ color: turn.role === 'alex' ? '#d1d5db' : '#ffffff' }}
          >
            {turn.text}
          </span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import VoiceOrb, { OrbState } from '@/components/VoiceOrb';
import Transcript, { Turn } from '@/components/Transcript';
import MicButton from '@/components/MicButton';
import { useSpeechRecognition } from '@/lib/speech';

type SessionStatus = 'loading' | 'ready' | 'speaking' | 'listening' | 'thinking' | 'error';

const DEFAULT_PROGRAM = process.env.NEXT_PUBLIC_DEFAULT_PROGRAM ?? 'AIX';
const DEFAULT_PERSONA = process.env.NEXT_PUBLIC_DEFAULT_PERSONA ?? 'Alex';

function buildGreeting(university: string, className: string, program: string, persona: string): string {
  return `Welcome to the onboarding arc for ${className} at ${university}. We are piloting this program and I'm glad you're here. I'm ${persona} — I'll be getting you set up today. This should take about 5 minutes. Can I get your first name?`;
}

function statusLabel(status: SessionStatus): string {
  switch (status) {
    case 'loading': return 'Initializing...';
    case 'speaking': return 'Alex is speaking...';
    case 'listening': return 'Listening...';
    case 'thinking': return 'Just a moment...';
    case 'error': return 'Connection error';
    default: return 'Tap to respond';
  }
}

function orbState(status: SessionStatus): OrbState {
  if (status === 'speaking') return 'speaking';
  if (status === 'listening') return 'listening';
  return 'idle';
}

async function speakText(text: string): Promise<void> {
  const res = await fetch('/api/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error(`/api/speak returned ${res.status}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Audio playback error'));
    };
    audio.play().catch(reject);
  });
}

function speakFallback(text: string): Promise<void> {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export default function SessionPage() {
  const searchParams = useSearchParams();

  const university = searchParams.get('university') ?? '';
  const className = searchParams.get('class') ?? '';
  const program = searchParams.get('program') ?? DEFAULT_PROGRAM;
  const persona = searchParams.get('persona') ?? DEFAULT_PERSONA;

  const threadId = useRef<string>('');
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    if (!threadId.current) {
      threadId.current = crypto.randomUUID();
    }
  }, []);

  const context = useRef({ university, className, program, persona });
  context.current = { university, className, program, persona };

  const handleLearnerSpeech = useCallback(async (transcript: string) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    setTurns((prev) => [...prev, { role: 'learner', text: transcript }]);
    setStatus('thinking');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transcript,
          threadId: threadId.current,
          context: context.current,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      const data = (await res.json()) as { response: string };
      const reply = data.response;

      setTurns((prev) => [...prev, { role: 'alex', text: reply }]);
      setStatus('speaking');

      try {
        await speakText(reply);
      } catch {
        await speakFallback(reply);
      }

      setStatus('ready');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setErrorMsg(msg);
      setStatus('error');
      console.error('Chat error:', msg);
    } finally {
      isProcessing.current = false;
    }
  }, []);

  const { isListening, startListening } = useSpeechRecognition(handleLearnerSpeech);

  useEffect(() => {
    if (isListening) {
      setStatus('listening');
    }
  }, [isListening]);

  useEffect(() => {
    let cancelled = false;

    async function runGreeting() {
      if (!university || !className) {
        setStatus('error');
        setErrorMsg('Missing required URL params: ?university=...&class=...');
        return;
      }

      const greeting = buildGreeting(university, className, program, persona);
      setTurns([{ role: 'alex', text: greeting }]);
      setStatus('speaking');

      try {
        await speakText(greeting);
      } catch {
        await speakFallback(greeting);
      }

      if (!cancelled) {
        setStatus('ready');
      }
    }

    runGreeting();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleMicClick() {
    if (status !== 'ready') return;
    startListening();
  }

  const showMic = status === 'ready' || status === 'listening';

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-between py-12 px-4"
      style={{ backgroundColor: '#0a0a0f' }}
    >
      <header className="text-center w-full max-w-xl">
        {university ? (
          <p
            className="text-xs font-mono uppercase tracking-[0.25em] mb-1"
            style={{ color: '#4b5563' }}
          >
            {university}
          </p>
        ) : null}
        {className ? (
          <p
            className="text-sm font-mono tracking-wide"
            style={{ color: '#6b7280' }}
          >
            {className}
          </p>
        ) : null}
        {!university && !className && (
          <p className="text-xs font-mono uppercase tracking-widest" style={{ color: '#374151' }}>
            {program}
          </p>
        )}
      </header>

      <section className="flex flex-col items-center gap-8 flex-1 justify-center w-full">
        <VoiceOrb state={orbState(status)} />

        {errorMsg && (
          <p className="text-xs font-mono text-red-400 max-w-sm text-center px-4">{errorMsg}</p>
        )}

        <div className="flex flex-col items-center gap-4">
          <p
            className="text-xs font-mono tracking-widest uppercase transition-all duration-300"
            style={{
              color:
                status === 'listening'
                  ? '#10b981'
                  : status === 'speaking'
                    ? '#7c3aed'
                    : '#4b5563',
            }}
          >
            {statusLabel(status)}
          </p>

          {showMic && (
            <MicButton onClick={handleMicClick} disabled={status === 'listening'} />
          )}
        </div>
      </section>

      <footer className="w-full max-w-xl pb-4">
        <Transcript turns={turns} />
      </footer>
    </main>
  );
}

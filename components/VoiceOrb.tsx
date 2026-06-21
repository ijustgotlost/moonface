'use client';

export type OrbState = 'idle' | 'speaking' | 'listening';

interface VoiceOrbProps {
  state: OrbState;
}

export default function VoiceOrb({ state }: VoiceOrbProps) {
  const coreColor =
    state === 'speaking'
      ? 'bg-violet-600'
      : state === 'listening'
        ? 'bg-emerald-500'
        : 'bg-blue-700';

  const glowColor =
    state === 'speaking'
      ? 'shadow-[0_0_80px_20px_rgba(124,58,237,0.45)]'
      : state === 'listening'
        ? 'shadow-[0_0_80px_20px_rgba(16,185,129,0.45)]'
        : 'shadow-[0_0_60px_15px_rgba(74,111,165,0.35)]';

  const animation =
    state === 'speaking'
      ? 'animate-speakPulse'
      : state === 'listening'
        ? 'scale-95'
        : 'animate-breathe';

  return (
    <div className="relative flex items-center justify-center w-52 h-52 select-none">
      {state === 'listening' && (
        <>
          <span className="absolute inset-0 rounded-full border border-emerald-400/40 animate-listenRing" />
          <span
            className="absolute inset-0 rounded-full border border-emerald-400/25 animate-listenRing"
            style={{ animationDelay: '0.5s' }}
          />
        </>
      )}

      <div
        className={[
          'relative rounded-full transition-all duration-500',
          'w-40 h-40',
          coreColor,
          glowColor,
          animation,
        ].join(' ')}
      >
        <div className="absolute inset-0 rounded-full bg-white/5" />
        <div className="absolute inset-4 rounded-full bg-white/5 blur-sm" />
      </div>
    </div>
  );
}

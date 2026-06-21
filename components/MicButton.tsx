'use client';

interface MicButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function MicButton({ onClick, disabled = false }: MicButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200',
        disabled
          ? 'bg-white/5 cursor-not-allowed opacity-40'
          : 'bg-white/10 hover:bg-white/20 cursor-pointer active:scale-95',
      ].join(' ')}
      aria-label="Tap to speak"
    >
      {!disabled && (
        <span className="absolute inset-0 rounded-full border border-white/20 animate-micRing" />
      )}
      <MicIcon />
    </button>
  );
}

function MicIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6 text-white"
    >
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}

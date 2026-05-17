"use client";

import { useAudioUnderstanding } from "../animations/useAudioUnderstanding";

function Waveform() {
  // GSAP drives the pulse when motion is allowed; otherwise we fall back to
  // the existing CSS `wave` keyframe (works with no JS and reduced motion).
  const { scope, reduced } = useAudioUnderstanding(true);

  const bars = Array.from({ length: 40 }, (_, i) => (
    <span
      key={i}
      data-wave-bar
      className={
        reduced
          ? "w-[2px] h-3 bg-accent rounded-full opacity-70 animate-[wave_1.2s_ease-in-out_infinite]"
          : "w-[2px] h-6 bg-accent rounded-full opacity-80 origin-center"
      }
      style={
        reduced
          ? {
              animationDelay: `${i * 0.05}s`,
              animationDuration: `${0.9 + (i % 5) * 0.12}s`,
            }
          : undefined
      }
    />
  ));

  return (
    <div
      ref={scope}
      className="flex gap-[4px] items-center h-7 justify-center"
    >
      {bars}
    </div>
  );
}

export function ProcessingState() {
  return (
    <div className="w-full max-w-[280px]" aria-live="polite">
      <Waveform />
      <div className="mt-4 flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] uppercase text-text-dim">
        <span>Transcribing</span>
        <span className="flex-1 h-px bg-text/10" aria-hidden />
        <span
          aria-hidden
          className="w-2 h-3.5 bg-accent animate-[pulse-light_1s_steps(1,end)_infinite]"
        />
      </div>
    </div>
  );
}

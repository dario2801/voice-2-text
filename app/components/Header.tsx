export function Header() {
  return (
    <header className="shrink-0 mb-6 relative">
      <div className="font-mono font-medium text-[11px] tracking-[0.35em] uppercase text-amber flex items-center gap-3 mb-3">
        <span className="w-2 h-2 bg-amber rounded-full shadow-[0_0_12px_var(--color-amber),0_0_4px_var(--color-amber)] animate-[pulse-light_3s_ease-in-out_infinite]" />
        Voice-2-Text
      </div>
      <h1 className="font-serif text-[clamp(32px,6vw,48px)] font-normal italic leading-[1.05] text-text tracking-[-0.02em]">
        Audio to English,
        <br />
        instantly.
      </h1>
      <p className="text-xs text-text-dim mt-3 tracking-[0.04em] leading-[1.7]">
        Upload any audio file. We&apos;ll detect the language and transcribe it
        to English using Whisper AI.
      </p>
      <div className="w-full h-px bg-gradient-to-r from-amber via-border to-transparent mt-5" />
    </header>
  );
}

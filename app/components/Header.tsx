export function Header() {
  return (
    <header className="shrink-0 mb-7 max-md:mb-5" data-animate>
      {/* Masthead colophon — newspaper nameplate row */}
      <div className="flex items-center justify-between gap-4 font-mono text-[10px] tracking-[0.3em] uppercase text-text-dim">
        <span className="flex items-center gap-2.5 text-accent">
          <span className="w-1.5 h-1.5 bg-accent rounded-full" />
          Voice&middot;2&middot;Text
        </span>
        <span className="max-sm:hidden">AUDAWORKS &mdash; Free AI Tools</span>
        <span className="tabular-nums">N&deg;01 &mdash; MMXXVI</span>
      </div>

      <div
        data-rule
        className="h-px bg-text/15 mt-3 mb-6 max-md:mb-5"
        aria-hidden
      />

      <h1 className="font-serif text-[clamp(36px,6.5vw,60px)] font-normal italic leading-[1.0] text-text tracking-[-0.025em]">
        Your voice,
        <br />
        in <span className="not-italic">text</span>.
      </h1>
      <p className="text-xs text-text-dim mt-4 tracking-[0.03em] leading-[1.75] max-w-[46ch]">
        Drop any audio file. We detect the language and return a clean
        transcript &mdash; or translate it to English with Whisper&nbsp;AI.
        More target languages soon.
      </p>
    </header>
  );
}

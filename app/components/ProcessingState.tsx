function Spinner() {
  const bars = Array.from({ length: 8 }, (_, i) => {
    const angle = i * 45;
    const rad = (angle * Math.PI) / 180;
    const tx = Math.sin(rad) * 8;
    const ty = -Math.cos(rad) * 8;
    return (
      <div
        key={i}
        className="absolute w-0.5 h-1.5 bg-amber left-1/2 top-1/2 origin-[center_0] rounded-sm animate-[spinner-fade_1s_linear_infinite]"
        style={{
          transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${angle}deg)`,
          animationDelay: `${i * 0.125}s`,
        }}
      />
    );
  });
  return <div className="w-5 h-5 relative shrink-0">{bars}</div>;
}

function Waveform() {
  const bars = Array.from({ length: 32 }, (_, i) => (
    <div
      key={i}
      className="w-[3px] bg-amber rounded-sm opacity-60 animate-[wave_1.2s_ease-in-out_infinite]"
      style={{
        animationDelay: `${i * 0.06}s`,
        animationDuration: `${0.8 + Math.random() * 0.8}s`,
      }}
    />
  ));
  return (
    <div className="flex gap-[3px] items-center h-8 mt-8 justify-center">
      {bars}
    </div>
  );
}

export function ProcessingState() {
  return (
    <>
      <Waveform />
      <div className="flex items-center gap-4 py-7 mt-8">
        <Spinner />
        <span className="text-[11px] text-text-dim tracking-[0.06em] animate-[text-pulse_2s_ease-in-out_infinite]">
          Transcribing &amp; translating...
        </span>
      </div>
    </>
  );
}

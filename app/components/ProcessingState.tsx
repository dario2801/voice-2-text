function Spinner() {
  const bars = Array.from({ length: 8 }, (_, i) => {
    const angle = i * 45;
    const rad = (angle * Math.PI) / 180;
    const tx = Math.sin(rad) * 8;
    const ty = -Math.cos(rad) * 8;
    return (
      <div
        key={i}
        className="spinner-bar"
        style={{
          transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${angle}deg)`,
          animationDelay: `${i * 0.125}s`,
        }}
      />
    );
  });
  return <div className="spinner">{bars}</div>;
}

function Waveform() {
  const bars = Array.from({ length: 32 }, (_, i) => (
    <div
      key={i}
      className="wave-bar"
      style={{
        animationDelay: `${i * 0.06}s`,
        animationDuration: `${0.8 + Math.random() * 0.8}s`,
      }}
    />
  ));
  return <div className="waveform">{bars}</div>;
}

export function ProcessingState() {
  return (
    <>
      <Waveform />
      <div className="processing">
        <Spinner />
        <span className="processing-text">
          Transcribing &amp; translating...
        </span>
      </div>
    </>
  );
}

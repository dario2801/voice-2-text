"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "./registerGsap";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Drives the "audio understanding" waveform during processing: a staggered,
 * physics-like scaleY pulse rippling out from the center, looping while
 * `active`. Returns the scope ref (attach to the bars' container) plus the
 * reduced-motion flag so the component can render a CSS-only fallback.
 *
 * useGSAP auto-reverts every tween it creates on unmount and (with
 * revertOnUpdate) when deps change — no orphaned tweens after Clear/unmount.
 */
export function useAudioUnderstanding(active: boolean) {
  const scope = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (!active || reduced) return;
      const bars = gsap.utils.toArray<HTMLElement>("[data-wave-bar]");
      if (!bars.length) return;

      gsap.fromTo(
        bars,
        { scaleY: 0.18 },
        {
          scaleY: 1,
          transformOrigin: "50% 50%",
          ease: "sine.inOut",
          duration: 0.5,
          stagger: {
            each: 0.045,
            from: "center",
            repeat: -1,
            yoyo: true,
          },
        }
      );
    },
    { scope, dependencies: [active, reduced], revertOnUpdate: true }
  );

  return { scope, reduced };
}

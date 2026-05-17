"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "./registerGsap";
import { useReducedMotion } from "./useReducedMotion";

/**
 * "Text generation" reveal: splits the transcription into words and staggers
 * them in (fade + rise). Re-runs whenever `text` changes (revertOnUpdate
 * cleans up the previous split + tweens, restoring the original DOM).
 *
 * Accessibility: nothing is hidden via CSS, so with JS disabled or reduced
 * motion the full text is shown immediately. useGSAP runs in a layout effect
 * (before paint) so there is no flash of unsplit text.
 */
export function useTextReveal(text: string) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !text) return;
      if (reduced) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }

      const split = new SplitText(el, {
        type: "words",
        wordsClass: "reveal-word",
      });
      gsap.set(el, { autoAlpha: 1 });
      gsap.from(split.words, {
        autoAlpha: 0,
        yPercent: 45,
        ease: "power3.out",
        duration: 0.55,
        stagger: 0.016,
      });

      return () => split.revert();
    },
    { scope: ref, dependencies: [text, reduced], revertOnUpdate: true }
  );

  return ref;
}

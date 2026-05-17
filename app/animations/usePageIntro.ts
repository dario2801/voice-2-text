"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "./registerGsap";
import { useReducedMotion } from "./useReducedMotion";

/**
 * One orchestrated page-load: marked blocks rise and fade in sequence while
 * hairline rules draw across. High-impact moment, done once.
 *
 * No-JS / reduced-motion safe: we use `gsap.from` (initial state lives in JS),
 * so without JS or with reduced motion nothing is hidden — everything shows
 * immediately. Returns the scope ref to attach to the page root.
 */
export function usePageIntro() {
  const scope = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-animate]");
      const rules = gsap.utils.toArray<HTMLElement>("[data-rule]");

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(
        items,
        { autoAlpha: 0, y: 18, duration: 0.7, stagger: 0.085 },
        0
      ).from(
        rules,
        {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.9,
          stagger: 0.1,
        },
        0.12
      );
    },
    { scope, dependencies: [reduced], revertOnUpdate: true }
  );

  return scope;
}

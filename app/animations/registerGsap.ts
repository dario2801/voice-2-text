"use client";

// Central GSAP setup. SplitText is 100% free since GSAP 3.13 (Webflow
// sponsorship), so no Club membership / extra config is needed. Registering
// here once keeps plugin registration idempotent across HMR and imports.

import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, SplitText);

export { gsap, SplitText, useGSAP };

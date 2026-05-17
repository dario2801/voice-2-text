# Pre-launch visual assets (required before deploy)

The redesign direction is **monochrome B&W minimalist** (see
`docs/design-references/` — NEXORA / YOURHOME / Melody). These assets are
referenced by the code but not yet present in `public/` (only `llms.txt`
exists). Broken icons / OG image hurt the "professional AUDAWORKS tool" goal,
so produce these before the definitive deploy.

| Asset | Path | Spec | Notes |
|---|---|---|---|
| Hero illustration | implement `app/components/HeroMotif.tsx` (currently renders nothing) then mount it in `app/page.tsx` at the center-spine comment | B&W, grain/halftone, transparent bg, SVG or PNG @2x | **Identity centerpiece**: human hand ↔ machine hand almost touching ("Creation of Adam" / NEXORA). Metaphor: voice → machine → text. The abstract placeholder was **removed** (it read like a target/bullseye); the page now shows only the clean center spine. Provide the real engraving and render it from `HeroMotif`, then place `<HeroMotif />` back on the seam in `page.tsx`. |
| Favicon | `public/favicon.ico` | multi-size .ico | Referenced in `app/layout.tsx` (`icons.icon`). Monochrome mark. |
| Apple touch icon | `public/apple-touch-icon.png` | 180×180 PNG | Referenced in `app/layout.tsx` + `app/manifest.ts`. |
| OG image | `public/og-image.png` | 1200×630 PNG | Referenced in `app/layout.tsx` (openGraph/twitter). Use the hand motif, monochrome, with "Voice-2-Text — a free AUDAWORKS AI tool". |

Keep all assets consistent with the palette in `app/globals.css` `@theme`
(`--color-bg #fafaf8`, `--color-accent #0f0f0f`). The final palette/fonts are
to be refined with the `/frontend-design:frontend-design` skill.

Reference images for the visual direction live in `docs/design-references/`.

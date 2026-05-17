import { NextRequest, NextResponse } from "next/server";

// Per-request CSP nonce. This is the recommended Next.js pattern: a strict
// script-src with a fresh nonce + 'strict-dynamic'. Next.js auto-propagates
// the nonce to its own bootstrap/hydration scripts when it sees the CSP on
// the request headers, and the layout applies it to the inline JSON-LD
// <script>. OWASP A03 (XSS hardening) / A05 (Security Misconfiguration).

export function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const isDev = process.env.NODE_ENV !== "production";

  const csp = [
    `default-src 'self'`,
    // 'strict-dynamic' lets the nonce'd Next loader pull in chunk scripts.
    // 'unsafe-eval' is only needed by the dev React refresh runtime.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Tailwind/Next inject inline <style>; styles are far lower risk than JS.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self' data:`,
    // Same-origin /api/transcribe; ws: for dev HMR only.
    `connect-src 'self'${isDev ? " ws:" : ""}`,
    `media-src 'self' blob:`,
    `worker-src 'self' blob:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  // Next.js reads the nonce from the CSP on the *request* headers to nonce
  // its own inline scripts — must be set here too, not only on the response.
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Apply to pages/app routes; skip Next static assets and the image
  // optimizer (they don't need a per-request nonce).
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};

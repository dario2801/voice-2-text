import type { NextConfig } from "next";

// Static, response-wide security headers. The per-request Content-Security-
// Policy (with a nonce) is set in middleware.ts instead — it cannot be a
// static header because the nonce changes every request.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), usb=(), payment=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // NOTE: this limit applies ONLY to Server Actions. It does NOT bound
      // the /api/transcribe Route Handler body — Next.js has no body-size
      // option for Route Handlers. The real protection is the early
      // Content-Length check + hard streaming cap in app/api/transcribe.
      bodySizeLimit: "25mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

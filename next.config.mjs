/** @type {import('next').NextConfig} */

/* ─────────────────────────────────────────────────────────────
 * Security Headers (applied to every response)
 * Tested against: securityheaders.com, observatory.mozilla.org
 * ───────────────────────────────────────────────────────────── */
const securityHeaders = [
  // Forces HTTPS for the next 2 years including subdomains
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Prevents MIME-type sniffing
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  // Prevents the site being framed by other origins (clickjacking)
  { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
  // Modern equivalent of X-Frame-Options
  { key: 'Content-Security-Policy',   value: "frame-ancestors 'self'" },
  // Limit referrer leak when navigating off-site
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  // Disable powerful APIs we don't use
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  // Legacy XSS protection (modern browsers ignore but harmless)
  { key: 'X-XSS-Protection',          value: '0' },
];

const nextConfig = {
  poweredByHeader: false,                       // hide "X-Powered-By: Next.js"
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

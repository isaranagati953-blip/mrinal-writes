/** @type {import('next').NextConfig} */
const nextConfig = {
  // Never expose source maps in production
  productionBrowserSourceMaps: false,

  // Strict security headers on every response
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""}`,   // tighten after build
              "style-src 'self' 'unsafe-inline'",
              "media-src 'self' blob: https://*.r2.cloudflarestorage.com",
              "img-src 'self' data:",
              "connect-src 'self' https://*.r2.cloudflarestorage.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Demo/placeholder imagery only, until real club photography is
      // uploaded via Cloudinary — see PROGRESS.md.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    // Needed for the hand-authored demo sponsor logos in public/sponsors/.
    // These are our own trusted static files, not user-uploaded content —
    // the strict CSP below still sandboxes them (no scripts) as defense in
    // depth. Safe to remove once real sponsor logos replace the demo SVGs.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  poweredByHeader: false, // don't advertise the framework — minor security hygiene
  staticPageGenerationTimeout: 180,
};

module.exports = nextConfig;

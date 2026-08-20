/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Demo/placeholder imagery only, until real club photography is
      // uploaded via Cloudinary — see PROGRESS.md.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  poweredByHeader: false, // don't advertise the framework — minor security hygiene
  staticPageGenerationTimeout: 180,
};

module.exports = nextConfig;

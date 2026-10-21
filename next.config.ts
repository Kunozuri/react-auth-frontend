import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // WHY THIS EXISTS: your page runs on localhost:3000 and Express on localhost:5500.
  // Browsers treat those as different "origins" and make cookies + CORS painful.
  // A rewrite makes Next.js forward every request that starts with /api to Express
  // behind the scenes, so the browser only ever talks to :3000.
  // Result: no CORS setup, and the auth cookies just work.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL ?? "http://localhost:5500"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

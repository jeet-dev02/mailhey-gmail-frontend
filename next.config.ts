import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Whenever the frontend asks for /api/...
        source: "/api/:path*",
        // Secretly fetch the data from your fast Vercel backend
        destination: "https://mailhey-simulation-backend.vercel.app/api/:path*",
      },
    ];
  },
};

export default nextConfig;
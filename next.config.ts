import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://34.254.56.65/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;

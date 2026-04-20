import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://192.168.18.159:8080/:path*",
      },
    ];
  },
};

export default nextConfig;

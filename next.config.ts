import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Align middleware/proxy buffering with speech route payload policy.
    proxyClientMaxBodySize: "35mb",
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  reactStrictMode: true,
  transpilePackages: ["@cxnext/ui", "@cxnext/hooks", "@cxnext/types"],
};

export default nextConfig;

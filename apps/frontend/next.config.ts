import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@cxnext/ui", "@cxnext/hooks", "@cxnext/types"],
};

export default nextConfig;

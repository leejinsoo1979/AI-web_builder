import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["169.254.154.91"],
  transpilePackages: ["@webable/builder-schema", "@webable/interaction-runtime"]
};

export default nextConfig;

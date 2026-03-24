import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  output: "export",
  basePath: "/simplyscan",
  assetPrefix: "/simplyscan/"
};

export default nextConfig;

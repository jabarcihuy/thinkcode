import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  serverExternalPackages: ["quickjs-emscripten"],
  outputFileTracingIncludes: {
    "/learn/*/lessons/*/pdf": ["./node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf", "./node_modules/geist/dist/fonts/geist-sans/Geist-Bold.ttf", "./node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf"],
  },
};

export default nextConfig;

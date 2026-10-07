import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  serverExternalPackages: ["quickjs-emscripten", "@sqlite.org/sqlite-wasm"],
  outputFileTracingIncludes: {
    "/api/guest/tests/*/submit": ["./src/features/assessment/providers/sqlite-assessment.worker.mjs", "./node_modules/@sqlite.org/sqlite-wasm/dist/node.mjs", "./node_modules/@sqlite.org/sqlite-wasm/dist/sqlite3.wasm", "./node_modules/@sqlite.org/sqlite-wasm/package.json"],
    "/api/guest/pdf/*": ["./node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf", "./node_modules/geist/dist/fonts/geist-sans/Geist-Bold.ttf", "./node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf"],
    "/api/admin/*/*": ["./src/features/assessment/providers/sqlite-assessment.worker.mjs", "./node_modules/@sqlite.org/sqlite-wasm/dist/node.mjs", "./node_modules/@sqlite.org/sqlite-wasm/dist/sqlite3.wasm", "./node_modules/@sqlite.org/sqlite-wasm/package.json"],
    "/api/assessment-sessions/*/submit": ["./src/features/assessment/providers/sqlite-assessment.worker.mjs", "./node_modules/@sqlite.org/sqlite-wasm/dist/node.mjs", "./node_modules/@sqlite.org/sqlite-wasm/dist/sqlite3.wasm", "./node_modules/@sqlite.org/sqlite-wasm/package.json"],
    "/learn/*/lessons/*/pdf": ["./node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf", "./node_modules/geist/dist/fonts/geist-sans/Geist-Bold.ttf", "./node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf"],
  },
};

export default nextConfig;

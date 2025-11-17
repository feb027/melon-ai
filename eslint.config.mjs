import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated files
    "public/sw.js",
    "public/workbox-*.js",
    "*.d.ts",
    // Example files
    "**/*.example.ts",
    "**/*.example.tsx",
    "**/*.example.js",
    "**/*.example.jsx",
    // Demo pages
    "app/demo/**",
    // Scripts
    "scripts/**",
    // Test files
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "test/**",
    "__tests__/**",
    "e2e/**",
  ]),
]);

export default eslintConfig;

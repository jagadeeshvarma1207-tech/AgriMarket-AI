import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Allow `any` in API data types — Prisma returns complex inferred types
      // and fetch responses are untyped by nature
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow unused vars prefixed with _ (common convention for intentional ignores)
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      // prefer-const is good practice but shouldn't block builds
      "prefer-const": "warn",
      // The react-hooks/exhaustive-deps rule can have false positives with useCallback
      "react-hooks/exhaustive-deps": "warn",
    },
  },
]);

export default eslintConfig;

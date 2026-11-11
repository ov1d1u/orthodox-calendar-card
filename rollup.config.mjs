import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/orthodox-calendar-card.ts",
  output: {
    file: "dist/orthodox-calendar-card.js",
    format: "es",
    inlineDynamicImports: true,
  },
  plugins: [resolve(), typescript(), terser({ format: { comments: false } })],
};

const typescript = require("@rollup/plugin-typescript");

const isDev = process.env.NODE_ENV === "development";

module.exports = {
  input: "./lib/index.ts",
  output: [
    {
      file: "./dist/index.cjs",
      format: "cjs",
      sourcemap: isDev,
    },
    {
      file: "./dist/index.mjs",
      format: "esm",
      sourcemap: isDev,
    },
  ],
  plugins: [typescript({ tsconfig: "./tsconfig.json" })],
};

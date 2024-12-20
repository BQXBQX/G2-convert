const typescript = require("@rollup/plugin-typescript");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const wasm = require("@rollup/plugin-wasm");
const copy = require("rollup-plugin-copy");

const isDev = process.env.NODE_ENV === "development";

module.exports = {
  // context: "window",
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
  plugins: [
    typescript({ tsconfig: "./tsconfig.json" }),
    nodeResolve(),
    commonjs(),
    wasm(),
    copy({
      targets: [{ src: "node_modules/@swc/wasm-web/*.wasm", dest: "dist" }],
    }),
  ],
};

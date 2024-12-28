import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Mock canvas
class Canvas {
  getContext() {
    return {
      measureText: () => ({ width: 0 }),
      fillText: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      fill: () => {},
      closePath: () => {},
    };
  }
}

// Setup browser environment
if (typeof document !== "undefined") {
  const originalCreateElement = document.createElement;
  document.createElement = (tag) => {
    if (tag.toLowerCase() === "canvas") {
      return new Canvas();
    }
    return originalCreateElement.call(document, tag);
  };
}

// Handle wasm file loading
const wasmPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../node_modules/.pnpm/@swc+wasm-web@1.10.3/node_modules/@swc/wasm-web/wasm_bg.wasm"
);

global.fetch = (url, options) => {
  const urlString = url.toString ? url.toString() : url;

  if (urlString.includes("wasm_bg.wasm")) {
    const wasmContent = fs.readFileSync(wasmPath);
    return Promise.resolve(new Response(wasmContent, {
      headers: {
        'content-type': 'application/wasm'
      }
    }));
  }

  if (urlString.startsWith("file://")) {
    const filePath = urlString.replace("file://", "");
    const data = fs.readFileSync(filePath);
    return Promise.resolve(new Response(data));
  }

  return fetch(url, options);
};

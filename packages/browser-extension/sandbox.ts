import { api2spec } from "@g2-convert/core";

window.addEventListener("message", async (event) => {
  const source = event.source as {
    window: WindowProxy;
  };

  const value = event.data;

  try {
    const spec = await api2spec(value);
    source.window.postMessage({ type: "success", data: spec }, event.origin);
  } catch (error) {
    source.window.postMessage({ 
      type: "error", 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }, event.origin);
  }
});

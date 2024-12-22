import { api2spec } from "@g2-convert/core";

window.addEventListener("message", async (event) => {
  const source = event.source as {
    window: WindowProxy;
  };

  const value = event.data;

  const spec = await api2spec(value);

  source.window.postMessage(spec, event.origin);
});

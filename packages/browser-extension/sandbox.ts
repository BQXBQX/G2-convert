import { api2spec, spec2api } from "@g2-convert/core";
import { format } from "prettier";
import babel from "prettier/plugins/babel.mjs";
import estree from "prettier/plugins/estree.mjs";
import stringifyObject from "stringify-object";

window.addEventListener("message", async (event) => {
  const source = event.source as {
    window: WindowProxy;
  };

  const value = event.data;

  try {
    let result = null;
    if (value.type === "api2spec") {
      result = await api2spec(value.code);
      result = await generateWarpSpec(result);
    } else {
      result = await spec2api(value.code);
      result = await format(result, {
        parser: "babel",
        plugins: [babel, estree],
      });
    }
    source.window.postMessage(
      { type: "success", result, transformType: value.type },
      event.origin
    );
  } catch (error) {
    source.window.postMessage(
      {
        type: "error",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      event.origin
    );
  }
});

/**
 * Generate spec code
 * @param options - The ChartSpec object to convert into a JavaScript object literal
 * @returns - A string containing the generated chart code
 */
export const generateWarpSpec = (options: object): Promise<string> => {
  // Generate the final chart code
  const code = (value: string) => `import { Chart } from '@antv/g2';
const chart = new Chart({
  container: 'container',
});
chart.options(
  ${value}
);
chart.render();`;

  return format(parseFunction(code(stringifyObject(options))), {
    parser: "babel",
    plugins: [babel, estree],
    bracketSpacing: true,
  });
};

const withFunction = (_: string, value: any) => {
  if (typeof value !== "function") return value;
  return `<func>${value.toString()}</func>`;
};

const parseFunction = (string: string) => {
  return string.replace(/"\<func\>(.*?)\<\/func\>"/g, (_, code: string) =>
    code.replace(/\\n/g, "\n").replace(/\\"/g, '"')
  );
};

import initSwc, { parse, print } from "@swc/wasm-web";
import type { Module } from "@swc/wasm-web";
import { filterAST, getChartInstantiationInfo } from "../common";
import Chart from "./chart";
import { removeUndefinedProperties } from "../common";
import eventEmitter from "../common/eventEmitter";

interface ChartSpec {
  [key: string]: unknown;
}

class ParsingError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = "ParsingError";
  }
}

/**
 * Convert API to Spec
 * api2spec is working by eval chart code
 * @param api
 * @returns
 */
export const api2spec = async (api: string): Promise<ChartSpec> => {
  if (!api || typeof api !== "string") {
    throw new ParsingError("Invalid API input: must be a non-empty string");
  }

  try {
    await initSwc();

    // Parse with TypeScript for better language support, typescript target is es2022
    const AST: Module = await parse(api, {
      syntax: "typescript",
      target: "es2022",
      tsx: false,
    });

    const { AST: usefulAst, otherModuleItems } = filterAST(AST);
    const { code } = await print(usefulAst);
    const instantiationInfo = getChartInstantiationInfo(AST);

    if (!instantiationInfo.instanceName) {
      throw new ParsingError("No chart instance found in the provided code");
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new ParsingError("Timeout: Spec generation took too long"));
      }, 5000);

      const cleanup = () => {
        clearTimeout(timeoutId);
        eventEmitter.removeAllListeners("spec");
      };

      eventEmitter.once("spec", (value) => {
        cleanup();
        const cleanSpec = removeUndefinedProperties(value as ChartSpec);
        resolve(cleanSpec);
      });

      try {
        evalChartCode(`${code}\n ${instantiationInfo.instanceName}.toSpec();`);
      } catch (error) {
        cleanup();
        reject(
          new ParsingError("Failed to evaluate chart code", error as Error)
        );
      }
    });
  } catch (error) {
    throw new ParsingError("Failed to process API code", error as Error);
  }
};

/**
 * Evaluate chart code
 * use try & catch to handle errors
 */
export const evalChartCode = (code: string): object => {
  const safeContext = Object.create(null);
  Object.assign(safeContext, { Chart });

  const wrappedCode = new Function(
    "context",
    `with (context) { 
       try {
         ${code}
       } catch (error) {
         throw new Error('Chart code evaluation failed: ' + error.message);
       }
     }`
  );

  return wrappedCode(safeContext);
};

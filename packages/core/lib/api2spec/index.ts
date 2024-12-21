import initSwc, { parse, print } from "@swc/wasm-web";
import type { Module } from "@swc/wasm-web";
import { filterAST, getChartInstantiationInfo } from "../common";
import Chart from "./chart";
import { removeUndefinedProperties } from "../common";
import eventEmitter from "../common/eventEmitter";

export const api2spec = async (api: string): Promise<object> => {
  await initSwc();

  // use typescript parser, because typescript is a superset of javascript
  const AST: Module = await parse(api, {
    syntax: "typescript",
  });
  const { AST: usefulAst, otherModuleItems } = filterAST(AST);
  const { code } = await print(usefulAst);

  const instantiationInfo = getChartInstantiationInfo(AST);

  let spec: object = {};

  eventEmitter.on("spec", (value) => {
    spec = value as object;
  });

  evalChartCode(`${code}\n ${instantiationInfo.instanceName}.toSpec();`);

  return removeUndefinedProperties(spec);
};

export const evalChartCode = (code: string): object => {
  const context = { Chart };
  const wrappedCode = new Function("context", `with (context) { ${code} }`);
  return wrappedCode(context);
};

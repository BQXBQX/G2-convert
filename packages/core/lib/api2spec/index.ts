import initSwc, { parse, print } from "@swc/wasm-web";
import type { Module } from "@swc/wasm-web";
import { filterAST, getInstanceInfo } from "../common";
import Chart from "./chart";
import { removeUndefinedProperties } from "../common";

export const api2spec = async (api: string): Promise<object> => {
  await initSwc();

  // use typescript parser, because typescript is a superset of javascript
  const ast: Module = await parse(api, {
    syntax: "typescript",
  });
  const { AST: usefulAst, otherModuleItems } = filterAST(ast);
  const { code } = await print(usefulAst);

  const instanceInfo = getInstanceInfo(ast);

  const spec = evalChartCode(
    `${code}\nreturn ${instanceInfo.instanceName}.options()`
  );

  return removeUndefinedProperties(spec);
};

export const evalChartCode = (code: string): object => {
  const context = { Chart };
  const wrappedCode = new Function("context", `with (context) { ${code} }`);
  return wrappedCode(context);
};

import initSwc, { parse, print } from "@swc/wasm-web";
import type { Module } from "@swc/wasm-web";
import { filterAST, getChartInstantiationInfo } from "../common";
import Chart from "./chart";
import { removeUndefinedProperties } from "../common";
import { getChartRelateModule } from "../common/getChartRelateModule";

export const api2spec = async (api: string): Promise<object> => {
  await initSwc();

  // use typescript parser, because typescript is a superset of javascript
  const AST: Module = await parse(api, {
    syntax: "typescript",
  });
  const { AST: usefulAst, otherModuleItems } = filterAST(AST);
  const { code } = await print(usefulAst);

  const instantiationInfo = getChartInstantiationInfo(AST);

  const spec = evalChartCode(
    `${code}\nreturn ${instantiationInfo.instanceName}.options()`
  );

  return removeUndefinedProperties(spec);
};

export const evalChartCode = (code: string): object => {
  const context = { Chart };
  const wrappedCode = new Function("context", `with (context) { ${code} }`);
  return wrappedCode(context);
};
const value = `
  import { Chart } from '@antv/g2';

  const data = [
    { letter: 'A', frequency: 0.08167 },
    { letter: 'B', frequency: 0.01492 },
    { letter: 'C', frequency: 0.02782 },
    { letter: 'D', frequency: 0.04253 },
    { letter: 'E', frequency: 0.12702 },
    { letter: 'F', frequency: 0.02288 },
    { letter: 'G', frequency: 0.02015 },
    { letter: 'H', frequency: 0.06094 },
    { letter: 'I', frequency: 0.06966 },
    { letter: 'J', frequency: 0.00153 },
    { letter: 'K', frequency: 0.00772 },
    { letter: 'L', frequency: 0.04025 },
    { letter: 'M', frequency: 0.02406 },
    { letter: 'N', frequency: 0.06749 },
    { letter: 'O', frequency: 0.07507 },
    { letter: 'P', frequency: 0.01929 },
    { letter: 'Q', frequency: 0.00095 },
    { letter: 'R', frequency: 0.05987 },
    { letter: 'S', frequency: 0.06327 },
    { letter: 'T', frequency: 0.09056 },
    { letter: 'U', frequency: 0.02758 },
    { letter: 'V', frequency: 0.00978 },
    { letter: 'W', frequency: 0.0236 },
    { letter: 'X', frequency: 0.0015 },
    { letter: 'Y', frequency: 0.01974 },
    { letter: 'Z', frequency: 0.00074 },
  ];
  const Ichart = new Chart({
    container: 'container',
    autoFit: true,
  });

  Ichart.interval().data(data).encode('x', 'letter').encode('y', 'frequency');

  Ichart.render();
  `;
export const main = async (value: string) => {
  // use typescript parser, because typescript is a superset of javascript
  await initSwc();
  const AST: Module = await parse(value, {
    syntax: "typescript",
  });

  const otherModuleItems = getChartRelateModule(AST);

  const code = await print({ ...AST, body: otherModuleItems });

  console.log(code);
};

main(value);

// api2spec(value).then((d) => {
//   console.log(d);
// });

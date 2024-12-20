import initSwc, { parse, print } from "@swc/wasm-web";
import type { Module } from "@swc/wasm-web"; // 用 import type 声明仅用于类型的导入
// import { Chart } from "@antv/g2";

// class MyChart extends Chart {
//   // 重写 render 方法
//   render() {
//     // 在这里可以执行自定义逻辑
//     console.log("MyChart custom render logic");

//     // 调用父类的 render 方法
//     super.render();

//     // 如果需要，在调用父类方法后添加其他逻辑
//     console.log("Render complete");
//   }
// }

// Filter function to remove import declarations
const filterImports = (ast: Module) => {
  if (ast.type === "Module") {
    ast.body = ast.body.filter(
      (node: any) => node.type !== "ImportDeclaration"
    );
  }
  return ast;
};

const value = `
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
const chart = new MyChart({
  container: 'container',
  autoFit: true,
});

chart.interval().data(data).encode('x', 'letter').encode('y', 'frequency');

console.log(JSON.stringify(chart.options()));
`;

export const api2spec = async (api: string) => {
  await initSwc();
  const ast: Module = await parse(value, {
    syntax: "typescript",
  });
  const filteredAst = filterImports(ast);
  const code = await print(filteredAst);
  return code.code;
};

// api2spec("").then((value) => {
//   console.log("Generated code:", value);
//   const context = { Chart }; // 将 MyChart 显式注入
//   const wrappedCode = `(function(context) { { ${value} } })`;
//   eval(wrappedCode)(context);
// });

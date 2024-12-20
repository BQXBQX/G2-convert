import { api2spec } from "@g2-convert/core";

api2spec("").then((value) => {
  console.log("Generated code:", value);
//   const context = { Chart }; // 将 MyChart 显式注入
//   const wrappedCode = `(function(context) { { ${value} } })`;
//   eval(wrappedCode)(context);
});

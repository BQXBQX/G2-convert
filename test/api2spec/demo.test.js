import { api2spec } from "@g2-convert/core";
import { test } from "vitest";
import _ from "lodash";

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

// 规范化函数字符串，移除不必要的空格
const normalizeFunctionString = (str) => {
  return str.replace(/\s+/g, " ").trim();
};

test("demo test", async () => {
  const code = await api2spec(value);
  console.log(code);

  // 检查函数字符串是否相等（忽略空格差异）
  // const offsetFn = code.children[0].scale.color.offset;
  // const expectedOffsetStr = ((t) => t * 0.8 + 0.1).toString();
  // expect(normalizeFunctionString(offsetFn.toString())).toBe(
  //   normalizeFunctionString(expectedOffsetStr)
  // );

  // const expected = {
  //   type: "spaceLayer",
  //   data: {
  //     type: "fetch",
  //     value:
  //       "https://gw.alipayobjects.com/os/bmw-prod/fb9db6b7-23a5-4c23-bbef-c54a55fee580.csv",
  //     format: "csv",
  //   },
  //   children: [
  //     {
  //       type: "interval",
  //       encode: { x: "letter", y: "frequency", color: "letter" },
  //       transform: [{ type: "sortX", reverse: true, by: "y" }],
  //       scale: {
  //         color: {
  //           palette: "cool",
  //           offset: offsetFn,
  //         },
  //       },
  //     },
  //     {
  //       type: "interval",
  //       x: 300,
  //       y: 50,
  //       width: 300,
  //       height: 300,
  //       encode: { y: "frequency", color: "letter" },
  //       transform: [{ type: "stackY" }],
  //       scale: {
  //         color: {
  //           palette: "cool",
  //           offset: offsetFn,
  //         },
  //       },
  //       coordinate: { type: "theta" },
  //       legend: false,
  //     },
  //   ],
  // };

  // // 自定义比较函数，保留函数比较（忽略空格差异）
  // const customEqual = (actual, expected) => {
  //   if (typeof actual === "function" && typeof expected === "function") {
  //     return (
  //       normalizeFunctionString(actual.toString()) ===
  //       normalizeFunctionString(expected.toString())
  //     );
  //   }
  //   if (Array.isArray(actual) && Array.isArray(expected)) {
  //     return (
  //       actual.length === expected.length &&
  //       actual.every((item, i) => customEqual(item, expected[i]))
  //     );
  //   }
  //   if (
  //     actual &&
  //     typeof actual === "object" &&
  //     expected &&
  //     typeof expected === "object"
  //   ) {
  //     return (
  //       Object.keys(actual).length === Object.keys(expected).length &&
  //       Object.keys(actual).every((key) =>
  //         customEqual(actual[key], expected[key])
  //       )
  //     );
  //   }
  //   return _.isEqual(actual, expected);
  // };
});

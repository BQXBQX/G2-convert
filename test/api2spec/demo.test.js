import { api2spec } from "@g2-convert/core";
import { test } from "vitest";
import _ from "lodash";

const value = `
import { Chart } from '@antv/g2';

const chart = new Chart({
  container: 'container',
});

const scaleColor = (node) =>
  node.scale('color', {
    palette: 'cool',
    offset: (t) => t * 0.8 + 0.1,
  });

const layer = chart.spaceLayer().data({
  type: 'fetch',
  value:
    'https://gw.alipayobjects.com/os/bmw-prod/fb9db6b7-23a5-4c23-bbef-c54a55fee580.csv',
  format: 'csv',
});

layer
  .interval()
  .transform({ type: 'sortX', reverse: true, by: 'y' })
  .encode('x', 'letter')
  .encode('y', 'frequency')
  .encode('color', 'letter')
  .call(scaleColor);

layer
  .interval()
  .attr('x', 300)
  .attr('y', 50)
  .attr('width', 300)
  .attr('height', 300)
  .coordinate({ type: 'theta' })
  .transform({ type: 'stackY' })
  .legend(false)
  .scale('color', {
    palette: 'cool',
    offset: (t) => t * 0.8 + 0.1,
  })
  .encode('y', 'frequency')
  .encode('color', 'letter')
  .call(scaleColor);
`;

// 规范化函数字符串，移除不必要的空格
const normalizeFunctionString = (str) => {
  return str.replace(/\s+/g, ' ').trim();
};

test("demo test", async () => {
  const code = await api2spec(value);
  
  // 检查函数字符串是否相等（忽略空格差异）
  const offsetFn = code.children[0].scale.color.offset;
  const expectedOffsetStr = ((t) => t * 0.8 + 0.1).toString();
  expect(normalizeFunctionString(offsetFn.toString()))
    .toBe(normalizeFunctionString(expectedOffsetStr));

  const expected = {
    type: "spaceLayer",
    data: {
      type: "fetch",
      value:
        "https://gw.alipayobjects.com/os/bmw-prod/fb9db6b7-23a5-4c23-bbef-c54a55fee580.csv",
      format: "csv",
    },
    children: [
      {
        type: "interval",
        encode: { x: "letter", y: "frequency", color: "letter" },
        transform: [{ type: "sortX", reverse: true, by: "y" }],
        scale: { 
          color: { 
            palette: "cool",
            offset: offsetFn
          } 
        },
      },
      {
        type: "interval",
        x: 300,
        y: 50,
        width: 300,
        height: 300,
        encode: { y: "frequency", color: "letter" },
        transform: [{ type: "stackY" }],
        scale: { 
          color: { 
            palette: "cool",
            offset: offsetFn
          } 
        },
        coordinate: { type: "theta" },
        legend: false,
      },
    ],
  };

  // 自定义比较函数，保留函数比较（忽略空格差异）
  const customEqual = (actual, expected) => {
    if (typeof actual === 'function' && typeof expected === 'function') {
      return normalizeFunctionString(actual.toString()) === 
             normalizeFunctionString(expected.toString());
    }
    if (Array.isArray(actual) && Array.isArray(expected)) {
      return actual.length === expected.length && 
        actual.every((item, i) => customEqual(item, expected[i]));
    }
    if (actual && typeof actual === 'object' && expected && typeof expected === 'object') {
      return Object.keys(actual).length === Object.keys(expected).length &&
        Object.keys(actual).every(key => customEqual(actual[key], expected[key]));
    }
    return _.isEqual(actual, expected);
  };

  expect(customEqual(code, expected)).toBe(true);
});

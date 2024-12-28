import { api2spec, spec2api } from "@g2-convert/core";
import { expect, test } from "vitest";
import _ from "lodash";

const value = `
import { Chart } from "@antv/g2";

const chart = new Chart({ container: "container" });

chart.options({
  type: "interval",
  autoFit: true,
  data: [
    { year: "1951 年", sales: 38 },
    { year: "1952 年", sales: 52 },
    { year: "1956 年", sales: 61 },
    { year: "1957 年", sales: 145 },
    { year: "1958 年", sales: 48 },
    { year: "1959 年", sales: 38 },
    { year: "1960 年", sales: 38 },
    { year: "1962 年", sales: 38 },
  ],
  encode: { x: "year", y: "sales" },
  coordinate: { transform: [{ type: "transpose" }] },
});

chart.render();
`;

test("simple-bar spec2api test", async () => {
  const code = await spec2api(value);
  console.log("🚀 ~ file: simple-bar.test.js:32 ~ code:", code)

  const options = await api2spec(code);

  expect(options).toEqual({
    type: "interval",
    autoFit: true,
    data: [
      { year: "1951 年", sales: 38 },
      { year: "1952 年", sales: 52 },
      { year: "1956 年", sales: 61 },
      { year: "1957 年", sales: 145 },
      { year: "1958 年", sales: 48 },
      { year: "1959 年", sales: 38 },
      { year: "1960 年", sales: 38 },
      { year: "1962 年", sales: 38 },
    ],
    encode: { x: "year", y: "sales" },
    coordinate: { transform: [{ type: "transpose" }] },
  });
});

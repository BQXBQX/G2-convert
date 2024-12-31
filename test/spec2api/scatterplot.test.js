import { api2spec, spec2api } from "@g2-convert/core";
import { test } from "vitest";
import { deepEqual } from "../utils/test-utils";

const value = `
import { Chart } from "@antv/g2";

const chart = new Chart({ container: "container" });

chart.options({
  type: "point",
  autoFit: true,
  data: {
    type: "fetch",
    value:
      " https://gw.alipayobjects.com/os/bmw-prod/474e51c8-b47b-4bb6-b3ed-87813a960df2.csv",
  },
  encode: { x: "mpg", y: "hp" },
  scale: { x: { nice: true, domainMax: 38 }, y: { nice: true } },
  labels: [
    {
      text: "name",
      stroke: "#fff",
      textAlign: "start",
      textBaseline: "middle",
      dx: 10,
      position: "left",
      fontSize: 10,
      lineWidth: 2,
    },
  ],
});

chart.render();

`;

test("Scatterplot Test", async () => {
  const code = await spec2api(value);
  console.log("🚀 ~ file: scatterplot.test.js:40 ~ code:", code)
  const options = await api2spec(code);

  const expected = {
    type: "point",
    autoFit: true,
    data: {
      type: "fetch",
      value:
        " https://gw.alipayobjects.com/os/bmw-prod/474e51c8-b47b-4bb6-b3ed-87813a960df2.csv",
    },
    encode: { x: "mpg", y: "hp" },
    scale: { x: { nice: true, domainMax: 38 }, y: { nice: true } },
    labels: [
      {
        text: "name",
        stroke: "#fff",
        textAlign: "start",
        textBaseline: "middle",
        dx: 10,
        position: "left",
        fontSize: 10,
        lineWidth: 2,
      },
    ],
  };

  deepEqual(options, expected);
});

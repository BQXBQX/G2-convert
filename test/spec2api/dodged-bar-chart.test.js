import { api2spec, spec2api } from "@g2-convert/core";
import { test } from "vitest";
import { deepEqual } from "../utils/test-utils";

const value = `
import { Chart } from "@antv/g2";

const chart = new Chart({ container: "container" });

chart.options({
  type: "interval",
  autoFit: true,
  data: {
    type: "fetch",
    value:
      "https://gw.alipayobjects.com/os/bmw-prod/f129b517-158d-41a9-83a3-3294d639b39e.csv",
    format: "csv",
  },
  encode: { x: "state", y: "population", color: "age" },
  transform: [
    { type: "sortX", by: "y", reverse: true, slice: 6 },
    { type: "dodgeX" },
  ],
  scale: { y: { nice: true } },
  axis: { y: { labelFormatter: "~s" } },
  interaction: {
    tooltip: { shared: true },
    elementHighlightByColor: { background: true },
  },
  title: {
    title: "Population by age and state",
    subtitle: "It shows the population of U.S. by age and state.",
  },
});

chart.render();
`;

test("Dodged Bar Chart Test", async () => {
  const code = await spec2api(value);

  const options = await api2spec(code);

  const expected = {
    type: "interval",
    autoFit: true,
    data: {
      type: "fetch",
      value:
        "https://gw.alipayobjects.com/os/bmw-prod/f129b517-158d-41a9-83a3-3294d639b39e.csv",
      format: "csv",
    },
    encode: { x: "state", y: "population", color: "age" },
    transform: [
      { type: "sortX", by: "y", reverse: true, slice: 6 },
      { type: "dodgeX" },
    ],
    scale: { y: { nice: true } },
    axis: { y: { labelFormatter: "~s" } },
    interaction: {
      tooltip: { shared: true },
      elementHighlightByColor: { background: true },
    },
    title: {
      title: "Population by age and state",
      subtitle: "It shows the population of U.S. by age and state.",
    },
  };

  deepEqual(options, expected);
});

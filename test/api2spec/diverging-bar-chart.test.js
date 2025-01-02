import { api2spec } from "@g2-convert/core";
import { test } from "vitest";
import { deepEqual } from "../utils/test-utils";

const value = `
/**
 * A recreation of this demo: https://vega.github.io/vega-lite/examples/bar_diverging_stack_population_pyramid.html
 */
import { Chart } from '@antv/g2';

const chart = new Chart({
  container: 'container',
  autoFit: true,
});

chart.coordinate({ transform: [{ type: 'transpose' }] });

chart
  .interval()
  .data({
    type: 'fetch',
    value:
      'https://gw.alipayobjects.com/os/bmw-prod/87b2ff47-2a33-4509-869c-dae4cdd81163.csv',
    transform: [
      {
        type: 'filter',
        callback: (d) => d.year === 2000,
      },
    ],
  })
  .encode('x', 'age')
  .encode('y', (d) => (d.sex === 1 ? -d.people : d.people))
  .encode('color', 'sex')
  .scale('color', { type: 'ordinal' })
  .scale('x', { range: [1, 0] })
  .axis('y', { labelFormatter: '~s' })
  .legend('color', { labelFormatter: (d) => (d === 1 ? 'Male' : 'Female') })
  .tooltip((d) => ({ value: d.people, name: d.sex === 1 ? 'Male' : 'Female' }));

chart.render();
`;

test("Diverging Bar Chart Test", async () => {
  const code = await api2spec(value);

  const expected = {
    type: "interval",
    autoFit: true,
    data: {
      type: "fetch",
      value:
        "https://gw.alipayobjects.com/os/bmw-prod/87b2ff47-2a33-4509-869c-dae4cdd81163.csv",
      transform: [
        {
          type: "filter",
          callback: (d) => d.year === 2000,
        },
      ],
    },
    encode: {
      x: "age",
      y: (d) => (d.sex === 1 ? -d.people : d.people),
      color: "sex",
    },
    scale: { color: { type: "ordinal" }, x: { range: [1, 0] } },
    coordinate: { transform: [{ type: "transpose" }] },
    axis: { y: { labelFormatter: "~s" } },
    legend: {
      color: {
        labelFormatter: (d) => (d === 1 ? "Male" : "Female"),
      },
    },
    tooltip: {
      items: [
        (d) => ({
          value: d.people,
          name: d.sex === 1 ? "Male" : "Female",
        }),
      ],
    },
  };

  deepEqual(code, expected);
});

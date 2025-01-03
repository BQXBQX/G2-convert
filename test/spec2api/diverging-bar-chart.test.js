import { api2spec, spec2api } from "@g2-convert/core";
import { test } from "vitest";
import { deepEqual } from "../utils/test-utils";
import { isAwaitKeyword } from "typescript";

const value = `
/**
 * A recreation of this demo: https://vega.github.io/vega-lite/examples/bar_diverging_stack_population_pyramid.html
 */
import { Chart } from "@antv/g2";

const chart = new Chart({ container: "container" });

chart.options({
  type: "interval",
  autoFit: true,
  data: {
    type: "fetch",
    value:
      "https://gw.alipayobjects.com/os/bmw-prod/87b2ff47-2a33-4509-869c-dae4cdd81163.csv",
    transform: [{ type: "filter", callback: (d) => d.year === 2000 }],
  },
  encode: {
    x: "age",
    y: (d) => (d.sex === 1 ? -d.people : d.people),
    color: "sex",
  },
  scale: { color: { type: "ordinal" }, x: { range: [1, 0] } },
  coordinate: { transform: [{ type: "transpose" }] },
  axis: { y: { labelFormatter: "~s" } },
  legend: { color: { labelFormatter: (d) => (d === 1 ? "Male" : "Female") } },
  tooltip: {
    items: [
      (d) => ({
        value: d.people,
        name: d.sex === 1 ? "Male" : "Female",
      }),
    ],
  },
});

chart.render();
`;

test("Diverging Bar Chart Test", async () => {
	const code = await spec2api(value);

	const options = await api2spec(code);

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
		interaction: {
			tooltip: {
				items: [
					(d) => ({
						value: d.people,
						name: d.sex === 1 ? "Male" : "Female",
					}),
				],
			},
		},
	};

	deepEqual(options, expected);
});

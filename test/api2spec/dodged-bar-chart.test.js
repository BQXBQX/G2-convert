import { api2spec } from "@g2-convert/core";
import { test } from "vitest";
import { deepEqual } from "../utils/test-utils";

const value = `
/**
 * A recreation of this demo: https://observablehq.com/@d3/grouped-bar-chart
 */
import { Chart } from '@antv/g2';

const chart = new Chart({
  container: 'container',
  autoFit: true,
});

chart.title({
  title: 'Population by age and state',
  subtitle: 'It shows the population of U.S. by age and state.',
});

chart
  .interval()
  .data({
    type: 'fetch',
    value:
      'https://gw.alipayobjects.com/os/bmw-prod/f129b517-158d-41a9-83a3-3294d639b39e.csv',
    format: 'csv',
  })
  .transform({ type: 'sortX', by: 'y', reverse: true, slice: 6 })
  .transform({ type: 'dodgeX' })
  .encode('x', 'state')
  .encode('y', 'population')
  .encode('color', 'age')
  .scale('y', { nice: true })
  .axis('y', { labelFormatter: '~s' });

chart
  .interaction('tooltip', { shared: true })
  .interaction('elementHighlightByColor', { background: true });

chart.render();
`;

test("Dodged Bar Chart Test", async () => {
	const code = await api2spec(value);

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

	deepEqual(code, expected);
});

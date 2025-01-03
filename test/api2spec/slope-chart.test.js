import { api2spec } from "@g2-convert/core";
import { test } from "vitest";
import { deepEqual } from "../utils/test-utils";

const value = `
/**
 * A recreation of this demo: https://observablehq.com/@d3/slope-chart
 */
import { Chart } from '@antv/g2';

const chart = new Chart({
  container: 'container',
  autoFit: true,
});

chart
  .line()
  .data({
    type: 'fetch',
    value:
      'https://gw.alipayobjects.com/os/bmw-prod/f0bbdcaa-9dbf-4d44-95c1-ac2e26765023.csv',
  })
  .encode('x', 'year')
  .encode('y', 'receipts')
  .encode('series', 'country')
  .encode('color', '#000')
  .scale('x', { type: 'point', padding: 0.25 })
  .label({
    text: (d) => \`\${d.country} \${d.receipts}\`,
    selector: 'first',
    transform: [{ type: 'overlapDodgeY' }],
    fontSize: 10,
    dx: -3,
    textAlign: 'end',
  })
  .label({
    text: (d) => \`\${d.receipts} \${d.country}\`,
    selector: 'last',
    transform: [{ type: 'overlapDodgeY' }],
    fontSize: 10,
    dx: 3,
  });

chart.render();
`;

test("Slope Chart Test", async () => {
	const code = await api2spec(value);

	const expected = {
		type: "line",
		autoFit: true,
		data: {
			type: "fetch",
			value:
				"https://gw.alipayobjects.com/os/bmw-prod/f0bbdcaa-9dbf-4d44-95c1-ac2e26765023.csv",
		},
		encode: { x: "year", y: "receipts", series: "country", color: "#000" },
		scale: { x: { type: "point", padding: 0.25 } },
		labels: [
			{
				text: (d) => `${d.country} ${d.receipts}`,
				selector: "first",
				transform: [{ type: "overlapDodgeY" }],
				fontSize: 10,
				dx: -3,
				textAlign: "end",
			},
			{
				text: (d) => `${d.receipts} ${d.country}`,
				selector: "last",
				transform: [{ type: "overlapDodgeY" }],
				fontSize: 10,
				dx: 3,
			},
		],
	};

	deepEqual(code, expected);
});

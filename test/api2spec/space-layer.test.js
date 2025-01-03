import { api2spec } from "@g2-convert/core";
import { test } from "vitest";
import { deepEqual } from "../utils/test-utils";

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

chart.render();
`;

test("Space Layer Test", async () => {
	const code = await api2spec(value);

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
				scale: { color: { palette: "cool", offset: (t) => t * 0.8 + 0.1 } },
			},
			{
				type: "interval",
				x: 300,
				y: 50,
				width: 300,
				height: 300,
				encode: { y: "frequency", color: "letter" },
				transform: [{ type: "stackY" }],
				scale: { color: { palette: "cool", offset: (t) => t * 0.8 + 0.1 } },
				coordinate: { type: "theta" },
				legend: false,
			},
		],
	};

	deepEqual(code, expected);
});

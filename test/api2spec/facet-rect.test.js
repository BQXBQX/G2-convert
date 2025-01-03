import { api2spec } from "@g2-convert/core";
import { test } from "vitest";
import { deepEqual } from "../utils/test-utils";

const value = `
/**
 * A recreation of one of these demos: https://observablehq.com/@observablehq/plot-facets?collection=@observablehq/plot
 */
import { Chart } from '@antv/g2';

const chart = new Chart({
  container: 'container',
  paddingBottom: 60,
  paddingLeft: 60,
  height: 640,
});

const facetRect = chart
  .facetRect()
  .data({
    type: 'fetch',
    value: 'https://assets.antv.antgroup.com/g2/penguins.json',
    transform: [
      {
        type: 'map',
        callback: ({
          culmen_depth_mm: depth,
          culmen_length_mm: length,
          ...d
        }) => ({
          ...d,
          culmen_depth_mm: depth === 'NaN' ? Number.NaN : depth,
          culmen_length_mm: length === 'NaN' ? Number.NaN : length,
        }),
      },
    ],
  })
  .encode('x', 'sex')
  .encode('y', 'species');

facetRect
  .point()
  .attr('facet', false)
  .attr('frame', false)
  .encode('x', 'culmen_depth_mm')
  .encode('y', 'culmen_length_mm')
  .style('fill', '#ddd')
  .style('lineWidth', 0);

facetRect
  .point()
  .encode('x', 'culmen_depth_mm')
  .encode('y', 'culmen_length_mm')
  .encode('color', 'island');

chart.render();
`;

test("Facet Rect Test", async () => {
	const code = await api2spec(value);

	const expected = {
		type: "facetRect",
		height: 640,
		paddingLeft: 60,
		paddingBottom: 60,
		data: {
			type: "fetch",
			value: "https://assets.antv.antgroup.com/g2/penguins.json",
			transform: [
				{
					type: "map",
					callback: ({
						culmen_depth_mm: depth,
						culmen_length_mm: length,
						...d
					}) => ({
						...d,
						culmen_depth_mm: depth === "NaN" ? Number.NaN : depth,
						culmen_length_mm: length === "NaN" ? Number.NaN : length,
					}),
				},
			],
		},
		encode: { x: "sex", y: "species" },
		children: [
			{
				type: "point",
				frame: false,
				encode: { x: "culmen_depth_mm", y: "culmen_length_mm" },
				style: { fill: "#ddd", lineWidth: 0 },
				facet: false,
			},
			{
				type: "point",
				encode: {
					x: "culmen_depth_mm",
					y: "culmen_length_mm",
					color: "island",
				},
			},
		],
	};

	deepEqual(code, expected);
});

import { api2spec, spec2api } from "@g2-convert/core";
import { test } from "vitest";
import { deepEqual } from "../utils/test-utils";

const value = `
import { Chart } from "@antv/g2";

const chart = new Chart({ container: "container" });

chart.options({
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
      text: (d) => \`\${d.country} \${d.receipts}\`,
      selector: 'first',
      transform: [{ type: 'overlapDodgeY' }],
      fontSize: 10,
      dx: -3,
      textAlign: 'end',
    },
    {
    text: (d) => \`\${d.receipts} \${d.country}\`,
    selector: 'last',
    transform: [{ type: 'overlapDodgeY' }],
    fontSize: 10,
    dx: 3,
  }
  ],
});

chart.render();
`;

test("Slope Chart Test", async () => {
	const code = await spec2api(value);
	const options = await api2spec(code);

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

	deepEqual(options, expected);
});

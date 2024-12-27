import { api2spec, spec2api } from "@g2-convert/core";
import { expect, test } from "vitest";
import _ from "lodash";

const value = `
import { Chart } from "@antv/g2";

const chart = new Chart({ container: "container" });

chart.options({
  type: "interval",
  data: {
    type: "fetch",
    value:
      "https://gw.alipayobjects.com/os/bmw-prod/fb9db6b7-23a5-4c23-bbef-c54a55fee580.csv",
  },
});

chart.render();
`;

test("简单柱形图 spec2api test", async () => {
  const code = await spec2api(value);

  const options = await api2spec(code);
  console.log("🚀 ~ file: demo.test.js:31 ~ options:", options);

  expect(options).toEqual({
    type: "interval",
    data: {
      type: "fetch",
      value:
        "https://gw.alipayobjects.com/os/bmw-prod/fb9db6b7-23a5-4c23-bbef-c54a55fee580.csv",
    },
  });
});

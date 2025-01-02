import { Chart as G2Chart } from "@antv/g2";
import eventEmitter from "../common/eventEmitter";

interface ChartOptions {
  type?: string;
  autoFit?: boolean;
  theme?: unknown;
  width?: number;
  height?: number;
  data?: unknown;
  encode?: Record<string, unknown>;
  transform?: unknown[];
  scale?: Record<string, unknown>;
  coordinate?: Record<string, unknown>;
  axis?: Record<string, unknown>;
  legend?: Record<string, unknown>;
  label?: Record<string, unknown>;
  children?: ChartOptions[];
  key?: string;
  [key: string]: unknown;
}

const sortObject = (
  obj: ChartOptions,
  keys: string[] = [
    "type",
    "autoFit",
    "theme",
    "width",
    "height",
    "data",
    "encode",
    "transform",
    "scale",
    "coordinate",
    "axis",
    "legend",
    "label",
    "children",
  ].reverse()
): ChartOptions => {
  const autoFit = Object.keys(obj).find((d) => d === "autoFit");
  const filter = ([key, _]: [string, unknown]): boolean =>
    !autoFit || !obj[autoFit] ? true : !(key === "width" || key === "height");

  return Object.fromEntries(
    Object.entries(obj)
      .sort(([a], [b]) => keys.indexOf(b) - keys.indexOf(a))
      .filter(filter)
  ) as ChartOptions;
};

const sortKeys = (options: ChartOptions): ChartOptions => {
  const newOptions = sortObject(options);
  return newOptions;
};

export class Chart extends G2Chart {
  // @ts-ignore
  options() {
    // @ts-ignore
    // biome-ignore lint/style/noArguments: <explanation>
    if (arguments.length !== 0) return super.options(...arguments);
    const options = super.options();

    // @ts-ignore
    const { type, children, key, ...rest } = options;
    const topLevel =
      type === "view" && Array.isArray(children) && children.length === 1
        ? { ...children[0], ...rest }
        : { type, children, ...rest };

    return sortKeys(topLevel);
  }

  public toSpec() {
    eventEmitter.emit("spec", this.options());
    return this;
  }
}

export default Chart;

import { type Argument, ModuleItem } from "@swc/wasm-web";
import { getKeyProperty } from "./getKeyProperty";
import { removeObjectFromArray } from "../common";

/**
 * every inject is consumer,
 * will remove this keyValue after inject
 */
const injectKeys = [
  "padding",
  "margin",
  "autoFit",
  "container",
  "renderer",
  "depth",
  "canvas",
  "width",
  "height",
  "plugins",
];

/**
 * @param options
 * @param instantModule
 */
export const InjectInstantModule = (
  options: Argument,
  instantModule: ModuleItem
) => {
  for (const key of injectKeys) {
    const props = getKeyProperty(options, key);
    if (props.length > 0) {
      instantModule.declarations[0].init.arguments[0].expression.properties.push(
        ...props
      );
      // consumer this option
      removeObjectFromArray(options.expression.properties, key);
    }
  }
};

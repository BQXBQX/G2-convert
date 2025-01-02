import { Argument, KeyValueProperty, ObjectExpression } from "@swc/wasm-web";
import { TypeGuards } from "../common/typeGurads";

export const getKeyProperty = (
  options: Argument,
  key: string
): KeyValueProperty[] => {
  const result: KeyValueProperty[] = [];
  for (const prop of (options.expression as ObjectExpression).properties) {
    if (
      TypeGuards.isKeyValueProperty(prop) &&
      TypeGuards.isIdentifier(prop.key) &&
      prop.key.value === key
    ) {
      result.push(prop);
    }
  }
  return result;
};

/**
 * G2 API Converter - Separates combined options into individual API calls
 *
 * This module transforms a single G2 options object into a series of chainable API calls.
 * Each property in the options object is converted to its corresponding G2 API method.
 *
 * Example Transformation:
 *
 * Input (Combined Options):
 * ```typescript
 * chart.options({
 *   type: "interval",
 *   autoFit: true,
 *   data: {
 *     type: "fetch",
 *     value: "https://gw.alipayobjects.com/os/bmw-prod/fb9db6b7-23a5-4c23-bbef-c54a55fee580.csv",
 *     filter: () => {
 *       return;
 *     },
 *   },
 *   encode: { x: "letter", y: "frequency" },
 * });
 * ```
 *
 * Output (Separated API Calls):
 * ```typescript
 * chart.interval();
 * chart.data({
 *     type: "fetch",
 *     value: "https://gw.alipayobjects.com/os/bmw-prod/fb9db6b7-23a5-4c23-bbef-c54a55fee580.csv",
 *     filter: () => {
 *       return;
 *     }
 *   });
 * chart.autoFit(true);
 * ```
 *
 *
 * @module generateApiSeparation
 */
import {
  Argument,
  ArrayExpression,
  BooleanLiteral,
  Expression,
  Identifier,
  KeyValueProperty,
  ModuleItem,
  ObjectExpression,
  StringLiteral,
  CallExpression,
  Span,
  Property,
  SpreadElement,
} from "@swc/wasm-web";
import { removeObjectFromArray } from "../common";

// Type guards for AST nodes
export const TypeGuards = {
  isKeyValueProperty: (
    prop: Property | SpreadElement
  ): prop is KeyValueProperty => prop.type === "KeyValueProperty",

  isIdentifier: (key: any): key is Identifier => key.type === "Identifier",

  isObjectExpression: (expr: Expression): expr is ObjectExpression =>
    expr.type === "ObjectExpression",

  isStringLiteral: (expr: Expression): expr is StringLiteral =>
    expr.type === "StringLiteral",

  isArrayExpression: (expr: Expression): expr is ArrayExpression =>
    expr.type === "ArrayExpression",

  isBooleanLiteral: (expr: Expression): expr is BooleanLiteral =>
    expr.type === "BooleanLiteral",
};

// Processing functions
const createCall = (
  methodName: string,
  args: Argument[] = []
): CallExpression => {
  return {
    type: "CallExpression",
    // @ts-ignore
    ctxt: 0,
    span: { start: 0, end: 0 } as Span,
    callee: {
      type: "MemberExpression",
      span: { start: 0, end: 0 } as Span,
      object: {
        type: "Identifier",
        ctxt: 0,
        span: { start: 0, end: 0 } as Span,
        value: "chart",
        optional: false,
      } as Identifier,
      property: {
        type: "Identifier",
        ctxt: 0,
        span: { start: 0, end: 0 } as Span,
        value: methodName,
        optional: false,
      } as Identifier,
    },
    arguments: args,
  };
};

// Create an Argument object
const createArgument = (expr: Expression): Argument => {
  return {
    expression: expr,
  };
};

interface PropertyMatcher {
  key: string;
  handler?: (prop: KeyValueProperty) => boolean;
}

/**
 * Find properties by key and optional handler
 * @param options ObjectExpression to search in
 * @param matchers Array of property matchers or single matcher
 * @returns Array of matching properties
 */
const findProperties = (
  options: ObjectExpression,
  matchers?: PropertyMatcher | PropertyMatcher[]
): KeyValueProperty[] => {
  // If no matchers provided, return all KeyValueProperties
  if (!matchers) {
    return options.properties.filter(
      (prop): prop is KeyValueProperty =>
        TypeGuards.isKeyValueProperty(prop) && TypeGuards.isIdentifier(prop.key)
    );
  }

  const matcherArray = Array.isArray(matchers) ? matchers : [matchers];
  const result: KeyValueProperty[] = [];

  for (const matcher of matcherArray) {
    for (const prop of options.properties) {
      if (
        TypeGuards.isKeyValueProperty(prop) &&
        TypeGuards.isIdentifier(prop.key) &&
        prop.key.value === matcher.key &&
        (!matcher.handler || matcher.handler(prop))
      ) {
        result.push(prop);
        removeObjectFromArray(options.properties, prop);
      }
    }
  }

  return result;
};

/**
 * Process properties with default handlers based on type
 * @param options ObjectExpression containing properties
 * @param key Property key to process
 * @param methodName Optional method name for the call
 */
const processDefault = (options: ObjectExpression): CallExpression[] => {
  const props = findProperties(options);
  if (!props.length) return [];

  const results: CallExpression[] = [];

  for (const prop of props) {
    const value = prop.value;
    if (
      TypeGuards.isStringLiteral(value) ||
      TypeGuards.isArrayExpression(value) ||
      TypeGuards.isObjectExpression(value) ||
      TypeGuards.isBooleanLiteral(value)
    ) {
      results.push(
        createCall((prop.key as Identifier).value, [createArgument(value)])
      );
    }

    // Handle function value
    if (
      value.type === "ArrowFunctionExpression" ||
      value.type === "FunctionExpression"
    ) {
      results.push(
        createCall((prop.key as Identifier).value, [createArgument(value)])
      );
    }
  }

  return results;
};

/**
 * remove autoFit from options, it only need to use when initialization
 */
const processAutoFit = (options: ObjectExpression): CallExpression[] => {
  const props = findProperties(options, {
    key: "autoFit",
    handler: (prop) => TypeGuards.isBooleanLiteral(prop.value),
  });
  return [];
};
/**
 * Process type property
 * TODO: support layer/facet type
 */
const processType = (options: ObjectExpression): CallExpression[] => {
  const props = findProperties(options, {
    key: "type",
    handler: (prop) => TypeGuards.isStringLiteral(prop.value),
  });

  if (!props.length) return [];

  const results: CallExpression[] = [];

  for (const prop of props) {
    if (TypeGuards.isStringLiteral(prop.value)) {
      results.push(createCall(prop.value.value));
    }

    // Handle function type
    if (
      prop.value.type === "ArrowFunctionExpression" ||
      prop.value.type === "FunctionExpression"
    ) {
      results.push(createCall("type", [createArgument(prop.value)]));
    }
  }

  return results;
};

type ProcessFunction = (
  options: ObjectExpression
) => CallExpression | CallExpression[] | null;

interface ChainBuilder {
  process(processor: ProcessFunction): ChainBuilder;
  getResult(): ModuleItem[];
}

class ASTChainBuilder implements ChainBuilder {
  private calls: CallExpression[] = [];

  constructor(private readonly options: ObjectExpression) {}

  process(processor: ProcessFunction): ChainBuilder {
    const result = processor(this.options);
    if (result) {
      if (Array.isArray(result)) {
        this.calls.push(...result);
      } else {
        this.calls.push(result);
      }
    }
    return this;
  }

  getResult(): ModuleItem[] {
    const items: ModuleItem[] = [];
    for (const call of this.calls) {
      items.push({
        type: "ExpressionStatement",
        span: { start: 0, end: 0, ctxt: 0 },
        expression: call,
      });
    }
    return items;
  }
}

// Export the function
export const generateApiSeparation = (options: Argument): ModuleItem[] => {
  if (
    !options?.expression ||
    !TypeGuards.isObjectExpression(options.expression)
  ) {
    throw new Error("Invalid options format");
  }

  return new ASTChainBuilder(options.expression)
    .process(processType)
    .process(processAutoFit)
    .process(processDefault)
    .getResult();
};

/**
 * convert options argument to api
 * is not mature, welcome to contribute to improve this
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
} from "@swc/wasm-web";
import { removeObjectFromArray } from "../common";

// Type guards for AST nodes
export const TypeGuards = {
  isKeyValueProperty: (prop: any): prop is KeyValueProperty =>
    prop.type === "KeyValueProperty",

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
  matchers: PropertyMatcher | PropertyMatcher[]
): KeyValueProperty[] => {
  const matcherArray = Array.isArray(matchers) ? matchers : [matchers];
  const result: KeyValueProperty[] = [];
  const remainingProps = [...options.properties];

  for (const matcher of matcherArray) {
    for (const prop of remainingProps) {
      if (
        TypeGuards.isKeyValueProperty(prop) &&
        TypeGuards.isIdentifier(prop.key) &&
        prop.key.value === matcher.key &&
        (!matcher.handler || matcher.handler(prop))
      ) {
        result.push(prop);
        removeObjectFromArray(remainingProps, prop);
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
const processDefault = (
  options: ObjectExpression,
  key: string,
  methodName: string = key
): CallExpression[] => {
  const props = findProperties(options, { key });
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
      results.push(createCall(methodName, [createArgument(value)]));
    }

    // Handle function value
    if (
      value.type === "ArrowFunctionExpression" ||
      value.type === "FunctionExpression"
    ) {
      results.push(createCall(methodName, [createArgument(value)]));
    }
  }

  return results;
};

/**
 * Process type property
 * Supports view/layer types and function types
 */
const processType = (options: ObjectExpression): CallExpression[] => {
  const props = findProperties(options, {
    key: "type",
    handler: (prop) =>
      TypeGuards.isStringLiteral(prop.value) ||
      prop.value.type === "ArrowFunctionExpression" ||
      prop.value.type === "FunctionExpression",
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
    .process((opt) => processDefault(opt, "data"))
    .process((opt) => processDefault(opt, "coordinate"))
    .process((opt) => processDefault(opt, "autoFit"))
    .getResult();
};

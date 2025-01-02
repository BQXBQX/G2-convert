import {
  ArrayExpression,
  BooleanLiteral,
  Expression,
  Identifier,
  KeyValueProperty,
  ModuleItem,
  NewExpression,
  ObjectExpression,
  Property,
  SpreadElement,
  StringLiteral,
  VariableDeclaration,
} from "@swc/wasm-web";

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

  isVariableDeclaration: (node: ModuleItem): node is VariableDeclaration =>
    node.type === "VariableDeclaration",
    
  isNewExpression: (expr: Expression): expr is NewExpression =>
    expr.type === "NewExpression",
};

/**
 * if you want to write filter function, please return { keep: boolean, type?: FilterType }
 */
import type { Module, ModuleItem } from "@swc/wasm-web";

enum FilterType {
  IMPORT = 0,
  USELESS = 1,
  RENDER = 2,
}

interface ReturnFilterAST {
  moduleItems: ModuleItem[];
  otherModuleItems: {
    [key: string]: ModuleItem[];
  };
}

type FilterFunction = (node: ModuleItem) => {
  keep: boolean;
  type?: FilterType;
};

/**
 * AST Filter Chain class
 */
class ASTFilterChain {
  private moduleItems: ModuleItem[];
  private importModuleItems: ModuleItem[] = [];
  private uselessModuleItems: ModuleItem[] = [];
  private renderModuleItems: ModuleItem[] = [];

  constructor(moduleItems: ModuleItem[]) {
    this.moduleItems = moduleItems;
  }

  /**
   * Apply a filter function to the module items
   */
  filter(filterFn: FilterFunction): this {
    const newModuleItems = this.moduleItems.filter((node) => {
      const result = filterFn(node);
      if (!result.keep) {
        switch (result.type) {
          case FilterType.IMPORT:
            this.importModuleItems.push(node);
            break;
          case FilterType.USELESS:
            this.uselessModuleItems.push(node);
            break;
          case FilterType.RENDER:
            this.renderModuleItems.push(node);
            break;
        }
      }
      return result.keep;
    });
    this.moduleItems = newModuleItems;
    return this;
  }

  /**
   * Get the filtered results
   */
  getResult(): ReturnFilterAST {
    return {
      moduleItems: this.moduleItems,
      otherModuleItems: {
        import: this.importModuleItems,
        useless: this.uselessModuleItems,
        render: this.renderModuleItems,
      },
    };
  }
}

/**
 * Filter AST, remove imports and useless code
 * @param AST AST Module
 * @returns
 */
export function filterAST(AST: Module): {
  AST: Module;
  otherModuleItems: {
    [key: string]: ModuleItem[];
  };
} {
  const chain = new ASTFilterChain(AST.body);

  const result = chain
    .filter(removeImports)
    .filter(removeConsoleLogs)
    .filter(removeChartRender)
    .getResult();

  return {
    AST: {
      ...AST,
      body: result.moduleItems,
    },
    otherModuleItems: result.otherModuleItems,
  };
}

/**
 * Filter function to remove import declarations
 */
const removeImports = (
  node: ModuleItem
): { keep: boolean; type?: FilterType } => {
  if (node.type === "ImportDeclaration") {
    return { keep: false, type: FilterType.IMPORT };
  }
  return { keep: true };
};

/**
 * Filter function to remove all console statements (log, warn, error, info, debug, etc.)
 * @param node
 * @returns
 */
const removeConsoleLogs = (
  node: ModuleItem
): { keep: boolean; type?: FilterType } => {
  if (
    node.type === "ExpressionStatement" &&
    node.expression.type === "CallExpression" &&
    node.expression.callee.type === "MemberExpression"
  ) {
    const { object, property } = node.expression.callee;

    if (
      object.type === "Identifier" &&
      object.value === "console" &&
      property.type === "Identifier" &&
      [
        "log",
        "warn",
        "error",
        "info",
        "debug",
        "trace",
        "dir",
        "table",
        "count",
        "countReset",
        "group",
        "groupEnd",
        "time",
        "timeEnd",
        "timeLog",
        "assert",
        "clear",
      ].includes(property.value)
    ) {
      return { keep: false, type: FilterType.USELESS };
    }
  }
  return { keep: true };
};

/**
 * Filter function to remove G2 chart render statements, because we don't need it
 * @param node
 * @returns
 */
const removeChartRender = (
  node: ModuleItem
): { keep: boolean; type?: FilterType } => {
  // chart.render() || myChart.render()
  if (
    node.type === "ExpressionStatement" &&
    node.expression.type === "CallExpression" &&
    node.expression.callee.type === "MemberExpression"
  ) {
    const { object, property } = node.expression.callee;
    if (
      property.type === "Identifier" &&
      property.value === "render" &&
      object.type === "Identifier"
    ) {
      return { keep: false, type: FilterType.RENDER };
    }
  }

  return { keep: true };
};

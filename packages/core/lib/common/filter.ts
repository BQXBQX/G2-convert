import type { Expression, Module, ModuleItem } from "@swc/wasm-web";

interface ReturnFilterAST {
  moduleItems: ModuleItem[];
  imports: ModuleItem[];
  uselessModuleItems: ModuleItem[];
}

type FilterFunction = (node: ModuleItem) => {
  keep: boolean;
  type?: "import" | "useless";
};

/**
 * AST Filter Chain class
 */
class ASTFilterChain {
  private moduleItems: ModuleItem[];
  private imports: ModuleItem[] = [];
  private uselessModuleItems: ModuleItem[] = [];

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
        if (result.type === "import") {
          this.imports.push(node);
        } else {
          this.uselessModuleItems.push(node);
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
      imports: this.imports,
      uselessModuleItems: this.uselessModuleItems,
    };
  }
}

/**
 * Filter AST, remove imports and useless code
 * @param ast AST Module
 * @returns
 */
export function filterAST(ast: Module): {
  ast: Module;
  imports: ModuleItem[];
  uselessModuleItems: ModuleItem[];
} {
  const chain = new ASTFilterChain(ast.body);

  const result = chain
    .filter(removeImports)
    .filter(removeConsoleLogs)
    .getResult();

  return {
    ast: {
      ...ast,
      body: result.moduleItems,
    },
    imports: result.imports,
    uselessModuleItems: result.uselessModuleItems,
  };
}

/**
 * Filter function to remove import declarations
 */
const removeImports = (
  node: ModuleItem
): { keep: boolean; type?: "import" | "useless" } => {
  if (node.type === "ImportDeclaration") {
    return { keep: false, type: "import" };
  }
  return { keep: true };
};

/**
 * Filter function to remove console.log statements
 */
const removeConsoleLogs = (
  node: ModuleItem
): { keep: boolean; type?: "import" | "useless" } => {
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
      property.value === "log"
    ) {
      return { keep: false, type: "useless" };
    }
  }
  return { keep: true };
};

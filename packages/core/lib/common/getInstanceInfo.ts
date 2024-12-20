import type { Module, ModuleItem } from "@swc/wasm-web";

/**
 * Get the instance name of new Chart() from AST
 * @param ast AST Module
 * @returns instance name and the ModuleItem containing the Chart instantiation
 */
export const getInstanceInfo = (
  ast: Module
): { instanceName: string | null; moduleItem: ModuleItem | null } => {
  for (const node of ast.body) {
    if (node.type === "VariableDeclaration") {
      const declaration = node.declarations[0];

      if (
        declaration.init?.type === "NewExpression" &&
        declaration.init.callee.type === "Identifier" &&
        declaration.init.callee.value === "Chart"
      ) {
        if (declaration.id.type === "Identifier") {
          return {
            instanceName: declaration.id.value,
            moduleItem: node,
          };
        }
      }
    }
  }

  return {
    instanceName: null,
    moduleItem: null,
  };
};

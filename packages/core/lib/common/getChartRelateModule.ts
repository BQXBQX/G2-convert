/**
 * if you want to write isFunction, please return { keep: boolean, variableName: string[] }
 * keep is if this module item is useful
 * variableName is this useful module identifier names
 */
import type { Identifier, Module, ModuleItem } from "@swc/wasm-web";
import { getChartInstantiationInfo } from "./getChartInstantiationInfo";

interface isFunctionReturn {
  keep: boolean;
  variableName: Set<string>;
}

export const getChartRelateModule = (AST: Module): ModuleItem[] => {
  const instantiationInfo = getChartInstantiationInfo(AST);
  if (!instantiationInfo.moduleItem || !instantiationInfo.instanceName) {
    throw new Error("Can't find chart instantiation");
  }

  const chartRelateModule = new ChartRelateModule(
    instantiationInfo.moduleItem,
    instantiationInfo.instanceName,
    AST.body
  )
    .search(isVariableHasChart)
    .search(isExpressionStartsWith)
    .getResult();

  return chartRelateModule.props.otherModuleItems;
};

class ChartRelateModule {
  /**
   * instantiationModuleItem
   * example: const chart = new Chart();
   */
  private instantiationModuleItem: ModuleItem;

  /**
   * externalModuleReferences
   * example:
   * const data = [...]
   * chart.data(data)
   */
  private externalModuleReferences: ModuleItem[] = [];

  // otherModuleItems
  private otherModuleItems: ModuleItem[] = [];

  // allModuleItems
  private allUsedIdentifiers: Set<string>;

  // allModuleItems
  private allModuleItems: ModuleItem[];
  /**
   *
   * @param instantiationModuleItem
   */
  constructor(
    instantiationModuleItem: ModuleItem,
    instanceName: string,
    allModuleItems: ModuleItem[]
  ) {
    this.instantiationModuleItem = instantiationModuleItem;
    this.allUsedIdentifiers = new Set([instanceName]);
    this.allModuleItems = allModuleItems;
  }

  /**
   * search useful module items
   * @param node
   * @returns
   */
  search(
    searchFn: (node: ModuleItem, identifierName: string) => isFunctionReturn
  ) {
    const searchResult: ModuleItem[] = [];

    for (const identifier of this.allUsedIdentifiers) {
      for (const node of this.allModuleItems) {
        const { keep, variableName } = searchFn(node, identifier);
        if (keep) {
          searchResult.push(node);
          this.otherModuleItems.push(node);
          for (const name of variableName) {
            this.allUsedIdentifiers.add(name);
          }
        }
      }
    }

    return this;
  }

  /**
   *  get instantiationModuleItem
   * @returns
   */
  getResult() {
    return {
      allModuleItems: this.allUsedIdentifiers,
      props: {
        instantiationModuleItem: this.instantiationModuleItem,
        externalModuleReferences: this.externalModuleReferences,
        otherModuleItems: this.otherModuleItems,
      },
    };
  }
}

/**
 * Check if a variable declaration has a specific identifier.
 * example:
 * const layer = chart.spaceLayer().data({});
 *
 * @param node - The variable declaration node to check.
 * @param identifierName - The name of the identifier to check for.
 * @returns True if the variable declaration has the specified identifier, false otherwise.
 */
const isVariableHasChart = (
  node: ModuleItem,
  identifierName: string
): isFunctionReturn => {
  if (node.type === "VariableDeclaration") {
    const declaration = node.declarations[0];
    if (declaration.init?.type === "CallExpression") {
      // Handle method chaining like chart.spaceLayer().data()
      let currentNode = declaration.init;
      while (currentNode && currentNode.type === "CallExpression") {
        if (currentNode.callee.type === "MemberExpression") {
          const object = currentNode.callee.object;
          // Check if it's chart.spaceLayer
          if (object.type === "Identifier" && object.value === identifierName) {
            return {
              keep: true,
              // @ts-ignore
              variableName: new Set([declaration.id.value]),
            };
          }
        }
        // Move up the chain
        // @ts-ignore
        currentNode = currentNode.callee.object;
      }
    }
  }
  return {
    keep: false,
    variableName: new Set(),
  };
};

/**
 * Check if an expression statement starts with a specific identifier.
 * example:
 * layer.interval()
 *   .transform({ type: 'sortX', reverse: true, by: 'y' })
 *   .encode('x', 'letter')
 *   .encode('y', 'frequency')
 *   .encode('color', 'letter')
 *   .call(scaleColor);
 *
 * @param node - The expression statement node to check.
 * @param identifierName - The name of the identifier to check for (e.g., 'layer').
 * @returns Object containing whether to keep the node and found identifiers.
 */
const isExpressionStartsWith = (
  node: ModuleItem,
  identifierName: string
): isFunctionReturn => {
  if (node.type !== "ExpressionStatement") {
    return {
      keep: false,
      variableName: new Set(),
    };
  }

  const expression = node.expression;
  if (expression.type !== "CallExpression") {
    return {
      keep: false,
      variableName: new Set(),
    };
  }

  const variableName = new Set<string>();
  let foundStartIdentifier = false;

  // Handle method chaining
  let currentNode = expression;
  while (currentNode && currentNode.type === "CallExpression") {
    // Check for identifiers in arguments
    for (const arg of currentNode.arguments as unknown as Identifier[]) {
      if (arg.type === "Identifier") {
        variableName.add(arg.value);
      }
    }

    if (currentNode.callee.type === "MemberExpression") {
      const object = currentNode.callee.object;
      if (object.type === "Identifier" && object.value === identifierName) {
        foundStartIdentifier = true;
      }
    }
    // Move up the chain
    // @ts-ignore
    currentNode = currentNode.callee.object;
  }

  console.log({
    foundStartIdentifier,
    variableName,
  });

  return {
    keep: foundStartIdentifier,
    variableName,
  };
};

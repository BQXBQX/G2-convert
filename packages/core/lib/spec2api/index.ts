import {
  ParsingError,
  filterAST,
  getChartInstantiationInfo,
  getOptions,
} from "../common";
import initSwc, { parse, type Module, print } from "@swc/wasm-web";
import { generateApi } from "./generateApi";
import { injectInstantModule } from "./injectInstantModule";

/**
 * Convert Spec to API
 * spec2api is working by swc ast
 * @param spec
 * @returns
 */
export const spec2api = async (spec: string): Promise<string> => {
  if (!spec || typeof spec !== "string") {
    throw new ParsingError("Invalid Spec input: must be a non-empty string");
  }

  try {
    await initSwc();

    const AST: Module = await parse(spec, {
      syntax: "typescript",
      target: "es2022",
      tsx: false,
    });

    const { AST: usefulAst, otherModuleItems } = filterAST(AST);

    const instantiationInfo = getChartInstantiationInfo(usefulAst);

    if (!instantiationInfo.moduleItem || !instantiationInfo.instanceName) {
      throw new ParsingError("Can't find chart instantiation");
    }

    if (AST.body.length === 0) {
      throw new ParsingError(
        "Can't find any useful module, please check your spec"
      );
    }

    const options = getOptions(usefulAst.body);

    injectInstantModule(options, instantiationInfo.moduleItem);

    const apiModuleItems = generateApi(options);

    const apiCode = await print({
      ...usefulAst,
      body: [
        ...otherModuleItems.import,
        instantiationInfo.moduleItem,
        ...apiModuleItems,
        ...otherModuleItems.render,
        ...otherModuleItems.useless,
      ],
    });

    return apiCode.code;
  } catch (error) {
    console.error(error);
    throw new ParsingError("Failed to process API code", error as Error);
  }
  return "";
};

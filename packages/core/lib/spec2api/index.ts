import { ParsingError, filterAST } from "../common";
import initSwc, { parse, type Module } from "@swc/wasm-web";

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

    if (AST.body.length === 0) {
      throw new ParsingError(
        "Can't find any useful module, please check your spec"
      );
    }
  } catch (error) {
    console.log(error);
  }
  return "";
};

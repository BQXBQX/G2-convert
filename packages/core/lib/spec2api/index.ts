import { ParsingError, filterAST, getOptions } from "../common";
import initSwc, { parse, type Module, print } from "@swc/wasm-web";
import { generateApiSeparation } from "./generateApiSeparation";

const value = `
chart.options({
  type: "interval",
});
`;

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

    const options = getOptions(usefulAst.body);

    const apiModuleItems = generateApiSeparation(options);

    const apiCode = await print({ ...usefulAst, body: apiModuleItems });

    console.log("🚀 ~ file: index.ts:67 ~ apiCode:", apiCode);
  } catch (error) {
    console.log(error);
  }
  return "";
};

spec2api(value);

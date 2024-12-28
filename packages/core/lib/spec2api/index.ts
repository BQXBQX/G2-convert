import {
  ParsingError,
  filterAST,
  getChartInstantiationInfo,
  getOptions,
} from "../common";
import initSwc, { parse, type Module, print } from "@swc/wasm-web";
import { generateApiSeparation } from "./generateApiSeparation";
import { getKeyProperty } from "./getKeyProperty";

const value = `
import { Chart } from "@antv/g2";

const chart = new Chart({ container: "container" });

chart.options({
  type: "interval",
  autoFit: true,
  data: {
    type: "fetch",
    value:
      "https://gw.alipayobjects.com/os/bmw-prod/fb9db6b7-23a5-4c23-bbef-c54a55fee580.csv",
    filter: () => {
      return;
    },
  },
  encode: { x: "letter", y: "frequency" },
});

chart.render();
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

    const autoFitProperties = getKeyProperty(options, "autoFit");

    if (autoFitProperties.length > 0) {
      // @ts-ignore
      instantiationInfo.moduleItem.declarations[0].init.arguments[0].expression.properties.push(
        ...autoFitProperties
      );
    }

    const apiModuleItems = generateApiSeparation(options);

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
    console.log(error);
  }
  return "";
};

spec2api(value).then((code) => {
  console.log(code);
});

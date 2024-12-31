import {
  ParsingError,
  filterAST,
  getChartInstantiationInfo,
  getOptions,
} from "../common";
import initSwc, { parse, type Module, print } from "@swc/wasm-web";
import { generateApiSeparation } from "./generateApiSeparation";
import { getKeyProperty } from "./getKeyProperty";
import { injectInstantModule } from "./injectInstantModule";

const value = `
import { Chart } from "@antv/g2";

const chart = new Chart({ container: "container" });

chart.options({
  type: "interval",
  autoFit: true,
  data: [
    { type: "分类一", value: 27 },
    { type: "分类二", value: 25 },
    { type: "分类三", value: 18 },
    { type: "分类四", value: 15 },
    { type: "分类五", value: 10 },
    { type: "Other", value: 5 },
  ],
  encode: { y: "value", color: "type", shape: "petal" },
  transform: [{ type: "stackY" }],
  coordinate: { type: "theta" },
  style: { offset: 0.5, ratio: 0.2 },
  animate: { enter: { type: "fadeIn" } },
  legend: false,
  labels: [
    {
      text: (d, i, data) =>
        d.type +
        "\
" +
        d.value,
      radius: 0.9,
      fontSize: 9,
      dy: 12,
    },
  ],
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

    injectInstantModule(options, instantiationInfo.moduleItem);

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

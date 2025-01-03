import type {
	Argument,
	ModuleItem,
	ObjectExpression,
	Span,
} from "@swc/wasm-web";
import { getKeyProperty } from "./getKeyProperty";
import { TypeGuards } from "../common/typeGurads";

const injectKeys = [
	"padding",
	"margin",
	"autoFit",
	"container",
	"renderer",
	"depth",
	"canvas",
	"width",
	"height",
	"plugins",
];

// create arguments
const createArguments = (value: ObjectExpression): Argument[] => {
	return [
		{
			expression: value,
		},
	];
};

/**
 * @param options
 * @param instantModule
 */
export const injectInstantModule = (
	options: Argument,
	instantModule: ModuleItem,
): void => {
	if (!options || !instantModule) {
		return;
	}

	for (const key of injectKeys) {
		const props = getKeyProperty(options, key);

		if (props.length > 0 && TypeGuards.isVariableDeclaration(instantModule)) {
			const declaration = instantModule.declarations[0];
			if (!declaration.init || !TypeGuards.isNewExpression(declaration.init)) {
				continue;
			}

			const initArguments = declaration.init.arguments;

			if (!initArguments || initArguments.length === 0) {
				declaration.init.arguments = createArguments({
					type: "ObjectExpression",
					span: { start: 0, end: 0 } as Span,
					properties: [...props],
				});
			} else {
				if (!TypeGuards.isObjectExpression(initArguments[0].expression)) {
					continue;
				}
				initArguments[0].expression.properties.push(...props);
			}
		}
	}
};

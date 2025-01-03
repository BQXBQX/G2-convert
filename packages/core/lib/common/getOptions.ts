import type { Argument, ModuleItem } from "@swc/wasm-web";
import { ParsingError } from ".";

/**
 * get options from chart.options()
 */
export const getOptions = (moduleItems: ModuleItem[]): Argument => {
	for (const node of moduleItems) {
		if (node.type === "ExpressionStatement") {
			const expression = node.expression;
			if (
				expression.type === "CallExpression" &&
				expression.callee.type === "MemberExpression" &&
				expression.callee.property.type === "Identifier" &&
				expression.callee.property.value === "options"
			) {
				// Get the first argument of chart.options()
				return expression.arguments[0];
			}
		}
	}

	throw new ParsingError("Could not find chart options in the provided code");
};

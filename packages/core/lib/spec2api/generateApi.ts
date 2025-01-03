/**
 * G2 API Converter - test combined options into individual API calls
 *
 * This module transforms a single G2 options object into a series of chainable API calls.
 * Each property in the options object is converted to its corresponding G2 API method.
 *
 * Example Transformation:
 *
 * Input (Combined Options):
 * ```typescript
 * chart.options({
 *   type: "interval",
 *   autoFit: true,
 *   data: {
 *     type: "fetch",
 *     value: "https://gw.alipayobjects.com/os/bmw-prod/fb9db6b7-23a5-4c23-bbef-c54a55fee580.csv",
 *     filter: () => {
 *       return;
 *     },
 *   },
 *   encode: { x: "letter", y: "frequency" },
 * });
 * ```
 *
 * Output (link API Calls):
 * ```typescript
 * chart.interval()
 *  .data({
 *     type: "fetch",
 *     value: "https://gw.alipayobjects.com/os/bmw-prod/fb9db6b7-23a5-4c23-bbef-c54a55fee580.csv",
 *     filter: () => {
 *       return;
 *     }
 *   });
 *
 * ```
 *
 *
 * @module generateApi
 */
import type {
	Argument,
	Expression,
	Identifier,
	KeyValueProperty,
	ModuleItem,
	ObjectExpression,
	CallExpression,
	Span,
	MemberExpression,
} from "@swc/wasm-web";
import { TypeGuards } from "../common/typeGurads";

// the all options of chart copy from docs of antv
const optionsKey = [
	"interval",
	"rect",
	"point",
	"area",
	"line",
	"vector",
	"link",
	"polygon",
	"image",
	"text",
	"lineX",
	"lineY",
	"range",
	"rangeX",
	"rangeY",
	"connector",
	"sankey",
	"treemap",
	"boxplot",
	"density",
	"heatmap",
	"shape",
	"pack",
	"forceGraph",
	"tree",
	"wordCloud",
	"gauge",
	"view",
	"spaceLayer",
	"spaceFlex",
	"facetRect",
	"facetCircle",
	"repeatMatrix",
	"timingKeyframe",
	"geoView",
	"geoPath",
	"point3D",
	"attr",
	"width",
	"height",
	"title",
	"encode",
	"options",
	"data",
	"transform",
	"theme",
	"style",
	"scale",
	"coordinate",
	"axis",
	"legend",
	"labelTransform",
	"interaction",
];

// Processing functions
const createCall = (
	methodName: string,
	args: Argument[] = [],
): CallExpression => {
	return {
		type: "CallExpression",
		// @ts-ignore
		ctxt: 0,
		span: { start: 0, end: 0 } as Span,
		callee: {
			type: "MemberExpression",
			span: { start: 0, end: 0 } as Span,
			object: {
				type: "Identifier",
				ctxt: 0,
				span: { start: 0, end: 0 } as Span,
				value: "chart",
				optional: false,
			} as Identifier,
			property: {
				type: "Identifier",
				ctxt: 0,
				span: { start: 0, end: 0 } as Span,
				value: methodName,
				optional: false,
			} as Identifier,
		},
		arguments: args,
	};
};

// Create an Argument object
const createArgument = (expr: Expression): Argument => {
	return {
		expression: expr,
	};
};

const createArgumentFromString = (str: string): Argument => {
	return {
		expression: {
			type: "StringLiteral",
			// @ts-ignore
			ctxt: 0,
			span: { start: 0, end: 0 } as Span,
			value: str,
			optional: false,
		},
	};
};

const createCallExpression = (
	callArguments: Argument[],
	object: MemberExpression,
): CallExpression => {
	return {
		type: "CallExpression",
		// @ts-ignore
		ctxt: 0,
		span: { start: 0, end: 0, ctxt: 0 } as Span,
		callee: object,
		arguments: callArguments,
	};
};

interface PropertyMatcher {
	key: string | string[];
	handler?: (prop: KeyValueProperty) => boolean;
}

/**
 * Find properties by key and optional handler
 * @param options ObjectExpression to search in
 * @param matchers Array of property matchers or single matcher
 * @returns Array of matching properties
 */
const findProperties = (
	options: ObjectExpression,
	matchers?: PropertyMatcher | PropertyMatcher[],
): KeyValueProperty[] => {
	// If no matchers provided, return all KeyValueProperties
	if (!matchers) {
		return options.properties.filter(
			(prop): prop is KeyValueProperty =>
				TypeGuards.isKeyValueProperty(prop) &&
				TypeGuards.isIdentifier(prop.key),
		);
	}

	const matcherArray = Array.isArray(matchers) ? matchers : [matchers];
	const result: KeyValueProperty[] = [];

	for (const matcher of matcherArray) {
		for (const prop of options.properties) {
			if (
				TypeGuards.isKeyValueProperty(prop) &&
				TypeGuards.isIdentifier(prop.key) &&
				(Array.isArray(matcher.key)
					? matcher.key.includes(prop.key.value)
					: prop.key.value === matcher.key) &&
				(!matcher.handler || matcher.handler(prop))
			) {
				result.push(prop);
			}
		}
	}

	return result;
};

/**
 * Process properties with default handlers based on type
 * @param options ObjectExpression containing properties
 * @param key Property key to process
 * @param methodName Optional method name for the call
 */
const processDefault = (
	options: ObjectExpression,
	key: string | string[],
): CallExpression[] => {
	const props = findProperties(options, { key });
	if (!props.length) return [];

	const results: CallExpression[] = [];

	for (const prop of props) {
		const value = prop.value;
		if (
			TypeGuards.isStringLiteral(value) ||
			TypeGuards.isArrayExpression(value) ||
			TypeGuards.isObjectExpression(value) ||
			TypeGuards.isBooleanLiteral(value)
		) {
			results.push(
				createCall((prop.key as Identifier).value, [createArgument(value)]),
			);
		}

		// Handle function value
		if (
			value.type === "ArrowFunctionExpression" ||
			value.type === "FunctionExpression"
		) {
			results.push(
				createCall((prop.key as Identifier).value, [createArgument(value)]),
			);
		}
	}

	return results;
};

/**
 * Process type property
 * TODO: support layer/facet type
 */
const processType = (options: ObjectExpression): CallExpression[] => {
	const props = findProperties(options, {
		key: "type",
		handler: (prop) => TypeGuards.isStringLiteral(prop.value),
	});

	if (!props.length) return [];

	const results: CallExpression[] = [];

	for (const prop of props) {
		if (TypeGuards.isStringLiteral(prop.value)) {
			results.push(createCall(prop.value.value));
		}

		// Handle function type
		if (
			prop.value.type === "ArrowFunctionExpression" ||
			prop.value.type === "FunctionExpression"
		) {
			results.push(createCall("type", [createArgument(prop.value)]));
		}
	}

	return results;
};

/**
 * Process label options
 * spec: labels
 * api: label
 */
const processLabel = (options: ObjectExpression): CallExpression[] => {
	const props = findProperties(options, {
		key: "labels",
	});

	if (!props.length) return [];

	const results: CallExpression[] = [];

	for (const prop of props) {
		results.push(createCall("label", [createArgument(prop.value)]));
	}

	return results;
};

const processTooltip = (options: ObjectExpression): CallExpression[] => {
	const props = findProperties(options, {
		key: "tooltip",
	});

	if (!props.length) return [];

	const results: CallExpression[] = [];

	for (const prop of props) {
		results.push(
			createCall("interaction", [
				createArgumentFromString("tooltip"),
				createArgument(prop.value),
			]),
		);
	}

	return results;
};

type ProcessFunction = (
	options: ObjectExpression,
) => CallExpression | CallExpression[] | null;

interface ChainBuilder {
	process(processor: ProcessFunction): ChainBuilder;
	getResult(): ModuleItem[];
}

class ASTChainBuilder implements ChainBuilder {
	private calls: CallExpression[] = [];

	constructor(private readonly options: ObjectExpression) {}

	process(processor: ProcessFunction): ChainBuilder {
		const result = processor(this.options);
		if (result) {
			if (Array.isArray(result)) {
				this.calls.push(...result);
			} else {
				this.calls.push(result);
			}
		}
		return this;
	}

	/**
	 * return link API Calls
	 */
	getResult(): ModuleItem[] {
		if (this.calls.length === 0) {
			return [];
		}

		const chartIdentifier: Identifier = {
			type: "Identifier",
			// @ts-ignore
			ctxt: 0,
			span: { start: 0, end: 0 } as Span,
			value: "chart",
			optional: false,
		};

		// Start with the first call
		let chainedExpression: CallExpression = createCallExpression(
			this.calls[0].arguments,
			{
				type: "MemberExpression",
				// @ts-ignore
				ctxt: 0,
				span: { start: 0, end: 0 } as Span,
				object: chartIdentifier,
				// @ts-ignore
				property: this.calls[0].callee.property,
			},
		);

		// Chain subsequent calls
		for (let i = 1; i < this.calls.length; i++) {
			chainedExpression = createCallExpression(this.calls[i].arguments, {
				type: "MemberExpression",
				// @ts-ignore
				ctxt: 0,
				span: { start: 0, end: 0 } as Span,
				object: chainedExpression,
				// @ts-ignore
				property: this.calls[i].callee.property,
			});
		}

		return [
			{
				type: "ExpressionStatement",
				span: { start: 0, end: 0, ctxt: 0 },
				expression: chainedExpression,
			},
		];
	}
}

// Export the function
export const generateApi = (options: Argument): ModuleItem[] => {
	if (
		!options?.expression ||
		!TypeGuards.isObjectExpression(options.expression)
	) {
		throw new Error("Invalid options format");
	}

	return new ASTChainBuilder(options.expression)
		.process(processType)
		.process(processLabel)
		.process(processTooltip)
		.process((options) => processDefault(options, optionsKey))
		.getResult();
};

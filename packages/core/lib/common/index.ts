export * from "./filter";
export * from "./getChartInstantiationInfo";
export * from "./getChartRelateModule";
export * from "./getOptions";

// remove undefined properties when return
export function removeUndefinedProperties(obj: object) {
	return Object.fromEntries(
		Object.entries(obj).filter(([_, value]) => value !== undefined),
	);
}

export class ParsingError extends Error {
	constructor(
		message: string,
		public readonly originalError?: Error,
	) {
		super(message);
		this.name = "ParsingError";
	}
}

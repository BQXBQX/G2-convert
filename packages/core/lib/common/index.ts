export * from "./filter";
export * from "./getChartInstantiationInfo";
export * from "./getChartRelateModule";
export * from "./getOptions";
export * from "./eventEmitter";

// remove undefined properties when return
export function removeUndefinedProperties(obj: object) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  );
}

export class ParsingError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = "ParsingError";
  }
}

export function removeObjectFromArray<T>(arr: T[], value: T): T[] {
  const index = arr.findIndex((item) => item === value);
  if (index !== -1) {
    arr.splice(index, 1);
  }
  return arr;
}

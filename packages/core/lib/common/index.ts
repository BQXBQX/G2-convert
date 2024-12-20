export * from "./filter";
export * from "./getInstanceInfo";

export function removeUndefinedProperties(obj: object) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  );
}

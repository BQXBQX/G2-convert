import { expect } from "vitest";

expect.extend({
	toEqualFunction(received, expected) {
		if (typeof received !== "function" || typeof expected !== "function") {
			return {
				pass: false,
				message: () => "Expected both values to be functions",
			};
		}

		const normalizeFunction = (fn) => {
			return fn
				.toString()
				.replace(/\s+/g, "") // 移除所有空白字符
				.replace(/['"]/g, '"') // 统一引号为双引号
				.replace(/\\/g, "") // 移除转义字符
				.replace(/,}/g, "}") // 移除对象字面量中的尾随逗号
				.replace(/,\)/g, ")") // 移除函数调用或数组中的尾随逗号
				.replace(/:\s*{/g, ":{") // 规范化对象属性冒号后的空格
				.replace(/,\s*/g, ","); // 规范化逗号后的空格
		};

		const receivedStr = normalizeFunction(received);
		const expectedStr = normalizeFunction(expected);

		return {
			pass: receivedStr === expectedStr,
			message: () =>
				`Expected functions to be equal:\nReceived: ${received.toString()}\nExpected: ${expected.toString()}\nNormalized Received: ${receivedStr}\nNormalized Expected: ${expectedStr}`,
		};
	},
});

export function deepEqual(obj1, obj2) {
	if (typeof obj1 === "function" && typeof obj2 === "function") {
		expect(obj1).toEqualFunction(obj2);
		return true;
	}
	if (Array.isArray(obj1) && Array.isArray(obj2)) {
		expect(obj1.length).toBe(obj2.length);
		obj1.forEach((item, index) => deepEqual(item, obj2[index]));
		return true;
	}
	if (
		typeof obj1 === "object" &&
		obj1 !== null &&
		typeof obj2 === "object" &&
		obj2 !== null
	) {
		expect(Object.keys(obj1)).toEqual(
			expect.arrayContaining(Object.keys(obj2)),
		);
		for (const key in obj1) {
			deepEqual(obj1[key], obj2[key]);
		}
		return true;
	}
	expect(obj1).toEqual(obj2);
	return true;
}

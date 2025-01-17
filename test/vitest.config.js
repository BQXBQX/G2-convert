import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		setupFiles: ["./setup.js"],
		environment: "jsdom",
		environmentOptions: {
			jsdom: {
				resources: "usable",
			},
		},
	},
});

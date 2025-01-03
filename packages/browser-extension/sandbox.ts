import { api2spec, generateWarpSpec, spec2api } from "@g2-convert/core";

window.addEventListener("message", async (event) => {
	const source = event.source as {
		window: WindowProxy;
	};

	const value = event.data;

	try {
		let result = null;
		if (value.type === "api2spec") {
			result = await api2spec(value.code);
		} else {
			result = await spec2api(value.code);
		}
		source.window.postMessage(
			{ type: "success", result, transformType: value.type },
			event.origin,
		);
	} catch (error) {
		source.window.postMessage(
			{
				type: "error",
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
			},
			event.origin,
		);
	}
});

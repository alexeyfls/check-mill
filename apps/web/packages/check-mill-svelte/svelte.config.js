import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
	plugins: [svelte()],
	build: {
		lib: {
			entry: "src/lib/index.ts",
			formats: ["es"],
			fileName: () => "check-mill-renderer.js",
		},
		rollupOptions: {
			external: ["svelte", "svelte/internal"],
		},
	},
});

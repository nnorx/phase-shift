import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	// Set base path for GitHub Pages deployment
	// Use root "/" for custom domain, or "/phase-shift/" for github.io subdirectory
	base: process.env.GITHUB_PAGES === "true" ? "/phase-shift/" : "/",
	plugins: [
		react({
			babel: {
				plugins: [["babel-plugin-react-compiler"]],
			},
		}),
		tailwindcss(),
	],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	build: {
		minify: "esbuild",
		cssMinify: true,
		sourcemap: false, // Disable source maps in production for smaller bundle
	},
});

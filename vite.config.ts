import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { crx } from '@crxjs/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import manifest from './src/manifest'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		crx({ manifest }),
		tailwindcss(),
	],
	resolve: {
		alias: {
		'@': resolve(__dirname, 'src'),
		},
	},
});
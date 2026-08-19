import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
	// Lets <script lang="ts"> in .svelte files be type-stripped by esbuild.
	preprocess: vitePreprocess(),
};

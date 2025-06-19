import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		outDir: `toy-blocks`,
	},

	base: './',

    plugins: [
        react(),
        viteStaticCopy({
            targets: [
                {
                    src: 'src/glsl', // Source folder
                    dest: ''         // Destination folder in dist (root of dist)
                }
            ]
        })
    ],
});

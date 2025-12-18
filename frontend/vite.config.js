import { defineConfig, normalizePath } from "vite";
import { fileURLToPath } from "url";
import { viteStaticCopy } from "vite-plugin-static-copy";

import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve pdfjs-dist path
const pdfjsDistPath = path.resolve(__dirname, "node_modules/pdfjs-dist");
const cMapsDir = normalizePath(path.join(pdfjsDistPath, "cmaps"));

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        nodePolyfills(),
        viteStaticCopy({
            targets: [
                {
                    src: cMapsDir,
                    dest: "",
                },
            ],
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
    proxy: {
      '/api': 'http://localhost:3000', // or your backend port
    },
  },
});

// @ts-check
import { defineConfig } from "astro/config";

import node from "@astrojs/node";

import tailwindcss from "@tailwindcss/vite";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel(),

  // adapter: node({
  //   mode: "standalone",
  // }),

  integrations: [
    // PWA integration removed
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});

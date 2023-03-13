import { defineConfig } from "vite";
import dns from "dns";
import tsconfigPaths from "vite-tsconfig-paths";

dns.setDefaultResultOrder("verbatim");

export default defineConfig({
  plugins: [tsconfigPaths()],
  base: "./",
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1500
  },
  server: {
    open: true,
    port: 3000,
    host: "localhost"
  }
});

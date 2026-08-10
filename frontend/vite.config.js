import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(directory, "index.html"),
        admin: resolve(directory, "admin.html"),
        sobre: resolve(directory, "sobre.html"),
        contato: resolve(directory, "contato.html"),
      },
    },
  },
});

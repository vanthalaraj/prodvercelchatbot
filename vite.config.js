import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // If the browser blocks calls to ollama.com with a CORS error, uncomment this
  // and change the fetch URL in src/App.jsx to "/ollama/api/chat":
  server: {
    proxy: {
      "/ollama": {
        target: "https://ollama.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama/, ""),
      },
    },
  },
});

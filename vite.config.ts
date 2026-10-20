import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API = "http://localhost:5136";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": API,
      "/health": API,
    },
  },
});

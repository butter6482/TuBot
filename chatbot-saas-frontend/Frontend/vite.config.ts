import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const useProxy = process.env.VITE_PROXY_TO_8000 === "1";

export default defineConfig({
  plugins: [react()],
  server: useProxy
    ? {
        proxy: {
          "/api": {
            target: "http://127.0.0.1:8000",
            changeOrigin: true,
          },
        },
      }
    : undefined,
});

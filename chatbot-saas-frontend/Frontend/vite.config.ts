import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({mode})=>{
  const env = loadEnv(mode, process.cwd(), "");
  const useProxy = env.VITE_PROXY_TO_8000 === "1";
  return {
    plugins: [react()],
    server: useProxy ? { proxy: { "/api": { target: "http://127.0.0.1:8000", changeOrigin: true } } } : undefined,
  };
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Sin proxy: /api/* lo sirve vercel dev (serverless) en el mismo dominio
});

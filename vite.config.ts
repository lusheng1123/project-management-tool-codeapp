import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { powerApps } from "@microsoft/power-apps-vite/plugin"

export default defineConfig({
  plugins: [react(), powerApps()],
  cacheDir: "node_modules/.vite",
  build: {
    rollupOptions: {
      cache: true,
    },
    cssCodeSplit: false,
    sourcemap: false,
    target: 'es2020',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@microsoft/power-apps'],
  },
})

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * Главный чанк весил 672 КБ — в него попадали React, роутер, весь
         * Radix и клиент Supabase разом. Посетитель ждал всё это до первой
         * отрисовки, а при выходе новой версии перекачивал целиком.
         *
         * Раскладываем по редкости изменений: библиотеки меняются раз в
         * несколько месяцев и остаются в кэше, наш код — каждую выкладку.
         */
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-router")) return "router";
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("xlsx")) return "xlsx";
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          // Остальное не трогаем: Rollup сам разложит по ленивым чанкам.
          // Общий "vendor" тянул бы в первую загрузку код, нужный только админке.
          return undefined;
        },
      },
    },
  },
}));

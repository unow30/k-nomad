import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // 테스트 환경 설정
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],

    // 커버리지 설정
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "vitest.setup.ts",
        "test/**",
        "**/types/**",
      ],
    },

    // 테스트 파일 패턴
    include: [
      "test/**/*.{test,spec}.{ts,tsx}",
    ],
  },

  // 경로 alias 설정
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});

import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "NHL Stats",
    identifier: "nhlstats.electrobun.dev",
    version: "1.0.0",
  },
  build: {
    mainProcess: "bun",
    bun: {
      entrypoint: "src/bun/index.ts",
    },
  },
} satisfies ElectrobunConfig;

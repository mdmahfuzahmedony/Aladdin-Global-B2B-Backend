import "dotenv/config";

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema",

  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/schema/seed.ts",
  },

  datasource: {
    url: env("DATABASE_URL"),
  },
});
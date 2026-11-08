import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { prisma } from "./config/prisma";

const PORT = Number(process.env.PORT) || 6001;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down server...");

  server.close(async () => {
    await prisma.$disconnect();
    console.log("Database disconnected");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

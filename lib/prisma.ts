import { PrismaClient } from "@prisma/client";

declare global {
  var EvCheckPrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.EvCheckPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.EvCheckPrisma = prisma;
}

import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    // During jest module scan, return a dummy — real client created on first use
    return null as unknown as PrismaClient;
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

let _prisma: PrismaClient | null = null;

const handler: ProxyHandler<object> = {
  get(_target, prop) {
    if (!_prisma) {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error(`DATABASE_URL not set. NODE_ENV=${process.env.NODE_ENV}`);
      }
      const adapter = new PrismaPg({ connectionString });
      _prisma = new PrismaClient({ adapter });
    }
    const value = (_prisma as any)[prop];
    return typeof value === "function" ? value.bind(_prisma) : value;
  },
};

export default new Proxy({}, handler) as PrismaClient;
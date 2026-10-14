import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

type DrizzleDatabase = ReturnType<typeof drizzle>;

let poolInstance: pg.Pool | undefined;
let databaseInstance: DrizzleDatabase | undefined;

function getPool(): pg.Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured for this API runtime.");
  }

  poolInstance ??= new Pool({
    connectionString,
    connectionTimeoutMillis: 5_000,
  });
  return poolInstance;
}

function getDatabase(): DrizzleDatabase {
  databaseInstance ??= drizzle(getPool(), { schema });
  return databaseInstance;
}

function lazyProxy<T extends object>(getInstance: () => T): T {
  return new Proxy({} as T, {
    get(_target, property) {
      const instance = getInstance();
      const value = Reflect.get(instance, property, instance) as unknown;
      return typeof value === "function" ? value.bind(instance) : value;
    },
    set(_target, property, value) {
      return Reflect.set(getInstance(), property, value);
    },
  });
}

export const pool = lazyProxy(getPool);
export const db = lazyProxy(getDatabase);

export * from "./schema";

import { MongoClient } from "mongodb";
import { env } from "./env.js";

// Keep the connection on globalThis so it is reused and not opened again and again
const cache = globalThis.__mongoCache || (globalThis.__mongoCache = { client: null, promise: null });

// Connect only when someone asks for the database (lazy), then reuse it
export const getDb = async () => {
  if (!env.dbUri) {
    throw new Error("DB_URI is missing in .env");
  }
  try {
    if (!cache.promise) {
      cache.client = new MongoClient(env.dbUri);
      cache.promise = cache.client.connect();
    }
    await cache.promise;
  } catch (error) {
    // If connecting failed, clear the cache so the next call can try again
    cache.client = null;
    cache.promise = null;
    throw error;
  }
  // The database name comes from inside the DB_URI
  return cache.client.db();
};
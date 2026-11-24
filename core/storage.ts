import { Redis } from "@upstash/redis";

/** Minimal JSON document store. The only thing the rest of the app knows about storage. */
export interface DocStore {
  get<T>(collection: string, id: string): Promise<T | null>;
  put<T>(collection: string, id: string, value: T): Promise<void>;
  /** Ids in the collection, most recently written first. */
  list(collection: string): Promise<string[]>;
}

class MemoryStore implements DocStore {
  private docs = new Map<string, unknown>();
  private order = new Map<string, string[]>();

  async get<T>(collection: string, id: string) {
    return (this.docs.get(`${collection}:${id}`) as T) ?? null;
  }
  async put<T>(collection: string, id: string, value: T) {
    this.docs.set(`${collection}:${id}`, value);
    const ids = (this.order.get(collection) ?? []).filter((x) => x !== id);
    this.order.set(collection, [id, ...ids]);
  }
  async list(collection: string) {
    return [...(this.order.get(collection) ?? [])];
  }
}

class RedisStore implements DocStore {
  constructor(private redis: Redis) {}

  async get<T>(collection: string, id: string) {
    return (await this.redis.get<T>(`${collection}:${id}`)) ?? null;
  }
  async put<T>(collection: string, id: string, value: T) {
    await this.redis.set(`${collection}:${id}`, value);
    await this.redis.zadd(`${collection}:index`, { score: Date.now(), member: id });
  }
  async list(collection: string) {
    return this.redis.zrange<string[]>(`${collection}:index`, 0, -1, { rev: true });
  }
}

// Keep one instance per server process; also survives dev hot reloads.
const g = globalThis as unknown as { __docStore?: DocStore };

/**
 * Upstash via the Vercel Marketplace sets KV_REST_API_*; direct Upstash setups use
 * UPSTASH_REDIS_REST_*. With neither, fall back to memory (local dev and tests only).
 */
export function getStore(): DocStore {
  if (g.__docStore) return g.__docStore;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    g.__docStore = new RedisStore(new Redis({ url, token }));
  } else if (process.env.VERCEL) {
    // In-memory state is per-instance on serverless: writes would silently vanish. Fail loudly.
    throw new Error(
      "Redis credentials missing (KV_REST_API_URL/KV_REST_API_TOKEN). Enable the Upstash store for this Vercel environment.",
    );
  } else {
    g.__docStore = new MemoryStore();
  }
  return g.__docStore;
}

export function storageKind(): "redis" | "memory" {
  return getStore() instanceof RedisStore ? "redis" : "memory";
}

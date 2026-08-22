import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Product, Transaction } from "./types";

interface KasirDB extends DBSchema {
  products: {
    key: string;
    value: Product;
  };
  transactions: {
    key: string;
    value: Transaction;
  };
  settings: {
    key: string;
    value: { key: string; value: unknown };
  };
}

const DB_NAME = "kasir-bazar";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<KasirDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<KasirDB>> {
  if (typeof window === "undefined") {
    throw new Error("getDB() must be called in the browser");
  }
  if (!dbPromise) {
    dbPromise = openDB<KasirDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("products")) {
          db.createObjectStore("products", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("transactions")) {
          db.createObjectStore("transactions", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}

export async function addProduct(p: Product): Promise<void> {
  const db = await getDB();
  await db.put("products", p);
}

export async function getProducts(): Promise<Product[]> {
  const db = await getDB();
  return db.getAll("products");
}

export async function updateProduct(p: Product): Promise<void> {
  const db = await getDB();
  await db.put("products", p);
}

export async function deleteProduct(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("products", id);
}

export async function addTransaction(t: Transaction): Promise<void> {
  const db = await getDB();
  await db.put("transactions", t);
}

export async function getTransactions(): Promise<Transaction[]> {
  const db = await getDB();
  return db.getAll("transactions");
}

export async function getSettings(): Promise<Record<string, unknown>> {
  const db = await getDB();
  const all = await db.getAll("settings");
  const out: Record<string, unknown> = {};
  for (const row of all) {
    out[row.key] = row.value;
  }
  return out;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put("settings", { key, value });
}

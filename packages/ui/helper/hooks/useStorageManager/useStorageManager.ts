/**
 * Examples:
 * // 1. Local/Session state hook
 * const [val, setVal] = useLocalStorage("key", "default");
 *
 * // 2. Async IndexedDB state hook
 * const [data, setData, loading] = useIndexedDB("user-profile", null);
 *
 * // 3. Storage manager helper usage
 * const manager = useStorageManager("indexeddb", { namespace: "app" });
 * await manager.setAsync("profile", { name: "John" });
 * const profile = await manager.getAsync("profile", null);
 */

import { useState, useEffect, useCallback } from "react";
import { StorageType, StorageOptions, StorageItem, StorageAdapter } from "./types";

const isServer = typeof window === "undefined";

// Memory Storage Fallback
class MemoryStorage implements StorageAdapter {
  private cache: Record<string, string> = {};

  get length() {
    return Object.keys(this.cache).length;
  }

  getItem(key: string): string | null {
    return this.cache[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.cache[key] = value;
  }

  removeItem(key: string): void {
    delete this.cache[key];
  }

  clear(): void {
    this.cache = {};
  }

  key(index: number): string | null {
    return Object.keys(this.cache)[index] ?? null;
  }
}

const memoryStorageInstance = new MemoryStorage();

// Cookie Storage Fallback
class CookieStorage implements StorageAdapter {
  get length() {
    if (isServer) return 0;
    return document.cookie.split(";").length;
  }

  getItem(key: string): string | null {
    if (isServer) return null;
    const name = `${key}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");
    for (let c of ca) {
      c = c.trim();
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  }

  setItem(key: string, value: string, days = 7): void {
    if (isServer) return;
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${key}=${encodeURIComponent(value)};${expires};path=/`;
  }

  removeItem(key: string): void {
    this.setItem(key, "", -1);
  }

  clear(): void {
    if (isServer) return;
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      this.removeItem(name.trim());
    }
  }

  key(index: number): string | null {
    if (isServer) return null;
    const cookies = document.cookie.split(";");
    const cookie = cookies[index];
    if (!cookie) return null;
    const eqPos = cookie.indexOf("=");
    return eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
  }
}

const cookieStorageInstance = new CookieStorage();

// IndexedDB Storage
class IndexedDBStorage {
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null = null;

  constructor(dbName = "app-storage", storeName = "key-value") {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new Error("IndexedDB not supported in this environment"));
        return;
      }
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, "readonly");
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result ?? null);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);
        const request = store.put(value, key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      // Ignore write failures gracefully
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      // Ignore delete failures
    }
  }

  async clear(namespace?: string): Promise<void> {
    try {
      const db = await this.getDB();
      if (!namespace) {
        return new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(this.storeName, "readwrite");
          const store = transaction.objectStore(this.storeName);
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }

      // Delete items starting with namespace prefix
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);
        const request = store.openKeyCursor();
        const prefix = `${namespace}:`;
        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            const k = String(cursor.key);
            if (k.startsWith(prefix)) {
              store.delete(k);
            }
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      // Ignore clear failures
    }
  }
}

const indexedDBStorageInstance = new IndexedDBStorage();

// Encryption helpers
const encryptValue = (val: string): string => btoa(encodeURIComponent(val));
const decryptValue = (val: string): string => decodeURIComponent(atob(val));

export function useStorageManager(
  type: StorageType = "local",
  defaultOptions: StorageOptions = {},
) {
  const getAdapter = useCallback((): StorageAdapter => {
    if (isServer) return memoryStorageInstance;
    try {
      switch (type) {
        case "local":
          return window.localStorage;
        case "session":
          return window.sessionStorage;
        case "cookie":
          return cookieStorageInstance;
        case "memory":
        default:
          return memoryStorageInstance;
      }
    } catch {
      return memoryStorageInstance;
    }
  }, [type]);

  const resolveKey = useCallback(
    (key: string) => {
      const parts: string[] = [];
      if (defaultOptions.namespace) parts.push(defaultOptions.namespace);
      parts.push(key);
      return parts.join(":");
    },
    [defaultOptions.namespace],
  );

  // Sync methods (will return fallbacks/no-ops for indexeddb)
  const get = useCallback(
    <T>(key: string, fallback: T): T => {
      if (type === "indexeddb") return fallback;
      const adapter = getAdapter();
      const resolvedKey = resolveKey(key);
      const raw = adapter.getItem(resolvedKey);

      if (raw === null) return fallback;

      try {
        const processed = defaultOptions.encrypt ? decryptValue(raw) : raw;
        const parsed: StorageItem<T> = JSON.parse(processed);

        if (parsed.expiry && Date.now() > parsed.expiry) {
          adapter.removeItem(resolvedKey);
          return fallback;
        }

        if (defaultOptions.version && parsed.version && parsed.version !== defaultOptions.version) {
          adapter.removeItem(resolvedKey);
          return fallback;
        }

        return defaultOptions.onAfterGet ? defaultOptions.onAfterGet(parsed.value) : parsed.value;
      } catch {
        return fallback;
      }
    },
    [getAdapter, resolveKey, defaultOptions, type],
  );

  const set = useCallback(
    <T>(key: string, value: T, options?: Omit<StorageOptions, "namespace">): void => {
      if (type === "indexeddb") return;
      const adapter = getAdapter();
      const resolvedKey = resolveKey(key);
      const opt = { ...defaultOptions, ...options };

      const processedValue = opt.onBeforeSet ? opt.onBeforeSet(value) : value;
      const item: StorageItem<T> = { value: processedValue };

      if (opt.ttl) item.expiry = Date.now() + opt.ttl;
      if (opt.version) item.version = opt.version;

      let serialized = JSON.stringify(item);
      if (opt.encrypt) serialized = encryptValue(serialized);

      adapter.setItem(resolvedKey, serialized);
    },
    [getAdapter, resolveKey, defaultOptions, type],
  );

  const remove = useCallback(
    (key: string): void => {
      if (type === "indexeddb") return;
      getAdapter().removeItem(resolveKey(key));
    },
    [getAdapter, resolveKey, type],
  );

  const clear = useCallback((): void => {
    if (type === "indexeddb") return;
    const adapter = getAdapter();
    if (!defaultOptions.namespace) {
      adapter.clear();
      return;
    }

    const prefix = `${defaultOptions.namespace}:`;
    const keysToRemove: string[] = [];
    for (let i = 0; i < adapter.length; i++) {
      const k = adapter.key(i);
      if (k?.startsWith(prefix)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => adapter.removeItem(k));
  }, [getAdapter, defaultOptions.namespace, type]);

  const has = useCallback(
    (key: string): boolean => {
      if (type === "indexeddb") return false;
      return getAdapter().getItem(resolveKey(key)) !== null;
    },
    [getAdapter, resolveKey, type],
  );

  // Async methods supporting IndexedDB as well as Sync wrappers
  const getAsync = useCallback(
    async <T>(key: string, fallback: T): Promise<T> => {
      const resolvedKey = resolveKey(key);
      if (type === "indexeddb") {
        const raw = await indexedDBStorageInstance.getItem(resolvedKey);
        if (raw === null) return fallback;
        try {
          const processed = defaultOptions.encrypt ? decryptValue(raw) : raw;
          const parsed: StorageItem<T> = JSON.parse(processed);
          if (parsed.expiry && Date.now() > parsed.expiry) {
            await indexedDBStorageInstance.removeItem(resolvedKey);
            return fallback;
          }
          if (
            defaultOptions.version &&
            parsed.version &&
            parsed.version !== defaultOptions.version
          ) {
            await indexedDBStorageInstance.removeItem(resolvedKey);
            return fallback;
          }
          return defaultOptions.onAfterGet ? defaultOptions.onAfterGet(parsed.value) : parsed.value;
        } catch {
          return fallback;
        }
      }
      return get(key, fallback);
    },
    [type, resolveKey, defaultOptions, get],
  );

  const setAsync = useCallback(
    async <T>(
      key: string,
      value: T,
      options?: Omit<StorageOptions, "namespace">,
    ): Promise<void> => {
      const resolvedKey = resolveKey(key);
      const opt = { ...defaultOptions, ...options };
      const processedValue = opt.onBeforeSet ? opt.onBeforeSet(value) : value;
      const item: StorageItem<T> = { value: processedValue };

      if (opt.ttl) item.expiry = Date.now() + opt.ttl;
      if (opt.version) item.version = opt.version;

      let serialized = JSON.stringify(item);
      if (opt.encrypt) serialized = encryptValue(serialized);

      if (type === "indexeddb") {
        await indexedDBStorageInstance.setItem(resolvedKey, serialized);
      } else {
        set(key, value, options);
      }
    },
    [type, resolveKey, defaultOptions, set],
  );

  const removeAsync = useCallback(
    async (key: string): Promise<void> => {
      const resolvedKey = resolveKey(key);
      if (type === "indexeddb") {
        await indexedDBStorageInstance.removeItem(resolvedKey);
      } else {
        remove(key);
      }
    },
    [type, resolveKey, remove],
  );

  const clearAsync = useCallback(async (): Promise<void> => {
    if (type === "indexeddb") {
      await indexedDBStorageInstance.clear(defaultOptions.namespace);
    } else {
      clear();
    }
  }, [type, defaultOptions.namespace, clear]);

  const hasAsync = useCallback(
    async (key: string): Promise<boolean> => {
      const resolvedKey = resolveKey(key);
      if (type === "indexeddb") {
        const raw = await indexedDBStorageInstance.getItem(resolvedKey);
        return raw !== null;
      }
      return has(key);
    },
    [type, resolveKey, has],
  );

  return {
    get,
    set,
    remove,
    clear,
    has,
    getAsync,
    setAsync,
    removeAsync,
    clearAsync,
    hasAsync,
  };
}

export function useStorage<T>(
  key: string,
  initialValue: T,
  type: StorageType = "local",
  options: StorageOptions = {},
) {
  const manager = useStorageManager(type, options);
  const [state, setState] = useState<T>(() => {
    if (type === "indexeddb") return initialValue;
    return manager.get(key, initialValue);
  });
  const [loading, setLoading] = useState<boolean>(type === "indexeddb");

  useEffect(() => {
    if (type !== "indexeddb") return;
    let active = true;
    manager.getAsync(key, initialValue).then((val) => {
      if (active) {
        setState(val);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [key, type, manager, initialValue]);

  const setStoredValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setState((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        if (type === "indexeddb") {
          manager.setAsync(key, next);
        } else {
          manager.set(key, next);
        }
        return next;
      });
    },
    [key, type, manager],
  );

  useEffect(() => {
    if (isServer || type !== "local") return;

    const handleStorageChange = (e: StorageEvent) => {
      const resolvedKey = options.namespace ? `${options.namespace}:${key}` : key;
      if (e.key === resolvedKey && e.newValue !== null) {
        try {
          const processed = options.encrypt ? decryptValue(e.newValue) : e.newValue;
          const parsed = JSON.parse(processed);
          setState(parsed.value);
        } catch {
          // Ignore
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, type, options.namespace, options.encrypt]);

  return [state, setStoredValue, loading] as const;
}

export function useLocalStorage<T>(key: string, initialValue: T, options?: StorageOptions) {
  return useStorage(key, initialValue, "local", options);
}

export function useSessionStorage<T>(key: string, initialValue: T, options?: StorageOptions) {
  return useStorage(key, initialValue, "session", options);
}

export function useIndexedDB<T>(key: string, initialValue: T, options?: StorageOptions) {
  return useStorage(key, initialValue, "indexeddb", options);
}

export function usePersistentState<T>(key: string, initialValue: T, options?: StorageOptions) {
  return useStorage(key, initialValue, "local", options);
}

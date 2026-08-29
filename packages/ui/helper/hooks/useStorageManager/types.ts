export type StorageType = "local" | "session" | "cookie" | "memory" | "indexeddb";

export interface StorageOptions {
  ttl?: number; // Time to live in milliseconds
  encrypt?: boolean;
  namespace?: string;
  version?: string;
  onBeforeSet?: (value: unknown) => unknown;
  onAfterGet?: (value: unknown) => unknown;
}

export interface StorageItem<T> {
  value: T;
  expiry?: number;
  version?: string;
}

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  key(index: number): string | null;
  length: number;
}

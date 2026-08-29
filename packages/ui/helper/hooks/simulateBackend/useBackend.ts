/**
 * Example:
 * interface Task { id: string; title: string; done: boolean; }
 * const { data, loading, fetchList, create } = useBackend<Task>("tasks");
 * useEffect(() => { fetchList({ page: 1, limit: 10 }); }, []);
 */

import { useState, useCallback } from "react";
import { useStorageManager } from "../useStorageManager";

export interface QueryParams<T> {
  page?: number;
  limit?: number;
  search?: string;
  searchKeys?: (keyof T)[];
  filter?: Partial<Record<keyof T, unknown>>;
  sort?: {
    key: keyof T;
    order: "asc" | "desc";
  };
}

export interface UseBackendResult<T> {
  data: T[];
  total: number;
  loading: boolean;
  error: Error | null;
  fetchList: (params?: QueryParams<T>) => Promise<T[]>;
  fetchOne: (id: string) => Promise<T | null>;
  create: (item: Omit<T, "id">) => Promise<T>;
  update: (id: string, updates: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

/**
 * Hook to simulate a persistent REST API backend collection using IndexedDB.
 * Supports CRUD, sorting, pagination, searching, and custom delay.
 */
export function useBackend<T extends { id: string }>(
  collectionName: string,
  delayMs = 400
): UseBackendResult<T> {
  const manager = useStorageManager("indexeddb", { namespace: `db:${collectionName}` });
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Helper for simulated network delay
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Retrieve raw items from IndexedDB
  const getAllItems = useCallback(async (): Promise<T[]> => {
    return manager.getAsync<T[]>("items", []);
  }, [manager]);

  // Fetch list of items with pagination, filtering, searching and sorting
  const fetchList = useCallback(
    async (params: QueryParams<T> = {}): Promise<T[]> => {
      setLoading(true);
      setError(null);
      try {
        await wait(delayMs);
        const allItems = await getAllItems();

        let filtered = [...allItems];

        // Apply Search
        if (params.search && params.searchKeys && params.searchKeys.length > 0) {
          const searchLower = params.search.toLowerCase();
          filtered = filtered.filter((item) =>
            params.searchKeys!.some((key) => {
              const val = item[key];
              return val ? String(val).toLowerCase().includes(searchLower) : false;
            })
          );
        }

        // Apply Exact Filters
        if (params.filter) {
          Object.entries(params.filter).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== "") {
              filtered = filtered.filter((item) => item[key as keyof T] === val);
            }
          });
        }

        // Apply Sorting
        if (params.sort) {
          const { key, order } = params.sort;
          filtered.sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            if (aVal === bVal) return 0;
            const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
            return order === "asc" ? comparison : -comparison;
          });
        }

        const totalCount = filtered.length;
        setTotal(totalCount);

        // Apply Pagination
        if (params.page && params.limit) {
          const start = (params.page - 1) * params.limit;
          filtered = filtered.slice(start, start + params.limit);
        }

        setData(filtered);
        return filtered;
      } catch (err) {
        const e = err instanceof Error ? err : new Error("Failed to fetch list");
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [getAllItems, delayMs]
  );

  // Fetch single item by ID
  const fetchOne = useCallback(
    async (id: string): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        await wait(delayMs);
        const allItems = await getAllItems();
        return allItems.find((item) => item.id === id) ?? null;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(`Failed to fetch item with id ${id}`);
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [getAllItems, delayMs]
  );

  // Create new item and persist
  const create = useCallback(
    async (newItem: Omit<T, "id">): Promise<T> => {
      setLoading(true);
      setError(null);
      try {
        await wait(delayMs);
        const allItems = await getAllItems();

        const createdItem = {
          ...newItem,
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
          createdAt: new Date().toISOString(),
        } as unknown as T;

        const updated = [createdItem, ...allItems];
        await manager.setAsync("items", updated);

        setData(updated);
        setTotal(updated.length);
        return createdItem;
      } catch (err) {
        const e = err instanceof Error ? err : new Error("Failed to create item");
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [getAllItems, manager, delayMs]
  );

  // Update existing item and persist
  const update = useCallback(
    async (id: string, updates: Partial<T>): Promise<T> => {
      setLoading(true);
      setError(null);
      try {
        await wait(delayMs);
        const allItems = await getAllItems();
        const itemIndex = allItems.findIndex((item) => item.id === id);

        if (itemIndex === -1) {
          throw new Error(`Item with id ${id} not found`);
        }

        const updatedItem = {
          ...allItems[itemIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        } as unknown as T;

        const updated = [...allItems];
        updated[itemIndex] = updatedItem;

        await manager.setAsync("items", updated);
        setData(updated);
        return updatedItem;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(`Failed to update item with id ${id}`);
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [getAllItems, manager, delayMs]
  );

  // Delete item from storage
  const remove = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await wait(delayMs);
        const allItems = await getAllItems();
        const updated = allItems.filter((item) => item.id !== id);

        await manager.setAsync("items", updated);
        setData(updated);
        setTotal(updated.length);
      } catch (err) {
        const e = err instanceof Error ? err : new Error(`Failed to remove item with id ${id}`);
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [getAllItems, manager, delayMs]
  );

  // Clear all items in database collection
  const clearAll = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await wait(delayMs);
      await manager.clearAsync();
      setData([]);
      setTotal(0);
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Failed to clear collection");
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [manager, delayMs]);

  return {
    data,
    total,
    loading,
    error,
    fetchList,
    fetchOne,
    create,
    update,
    remove,
    clearAll,
  };
}
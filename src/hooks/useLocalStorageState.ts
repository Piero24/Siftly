/**
 * useLocalStorageState — Generic hook for state backed by localStorage.
 *
 * Eliminates the repeated pattern of:
 *   1. Check `typeof window === 'undefined'`
 *   2. Try reading from localStorage
 *   3. Parse/validate the stored value
 *   4. Fall back to a default
 *   5. Persist changes back to localStorage in a useEffect
 *
 * @param key - The localStorage key
 * @param defaultValue - Fallback value when no stored value exists
 * @param options - Optional serializer/deserializer for non-string values
 */
import { useState, useEffect } from 'react';

interface LocalStorageOptions<T> {
  /** Convert the stored string back into the typed value. Defaults to identity. */
  deserialize?: (raw: string) => T | null;
  /** Convert the typed value into a string for storage. Defaults to `String()`. */
  serialize?: (value: T) => string;
}

/**
 * Reads an initial value from localStorage, falling back to `defaultValue`.
 * Returns a `[value, setValue]` tuple and auto-persists changes.
 */
export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
  options?: LocalStorageOptions<T>
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const { deserialize, serialize } = options ?? {};

  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const stored = window.localStorage.getItem(key);
      if (stored === null) return defaultValue;

      if (deserialize) {
        const parsed = deserialize(stored);
        return parsed !== null ? parsed : defaultValue;
      }

      // For primitive string/boolean/number matching, return as-is cast
      return stored as unknown as T;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      const serialized = serialize ? serialize(value) : String(value);
      window.localStorage.setItem(key, serialized);
    } catch {
      // Best-effort — ignore quota/security failures.
    }
  }, [key, value, serialize]);

  return [value, setValue];
}

// ── Pre-built serializers for common types ──

/** Serializer for JSON-encoded objects (e.g. notifications, privacy, tableDisplay). */
export const jsonSerializer = <T>() => ({
  serialize: (v: T) => JSON.stringify(v),
  deserialize: (raw: string): T | null => {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
});

/** Serializer for boolean values stored as "true"/"false" strings. */
export const booleanSerializer = {
  serialize: (v: boolean) => String(v),
  deserialize: (raw: string): boolean | null => {
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    return null;
  },
};

/** Serializer for integer values with a minimum bound. */
export const intSerializer = (min = 0) => ({
  serialize: (v: number) => String(Math.max(min, Math.floor(v))),
  deserialize: (raw: string): number | null => {
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < min) return null;
    return parsed;
  },
});

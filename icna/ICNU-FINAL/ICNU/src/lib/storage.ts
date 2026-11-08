import { useCallback, useContext, useSyncExternalStore } from "react";
import { PatientScope, isPatientKey } from "./patientScope";
import { todayISO } from "./dates";

/**
 * Almacenamiento persistente en localStorage, sincronizado entre todos los
 * componentes que usan la misma clave (y entre pestañas del navegador).
 *
 * Uso:
 *   const [entries, setEntries] = usePersistentState("log:entries", seedEntries);
 *   setEntries((current) => [...current, nueva]);
 */

const PREFIX = "cuidados:v1:";

type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();
/**
 * Caché por clave: guarda la última materia prima leída y el valor ya parseado.
 * Es necesario porque useSyncExternalStore exige que getSnapshot devuelva el
 * mismo objeto entre llamadas mientras no cambie el dato.
 */
const cache = new Map<string, { raw: string | null; value: unknown }>();

function keyOf(key: string) {
  return PREFIX + key;
}

function emit(key: string) {
  listeners.get(keyOf(key))?.forEach((listener) => listener());
}

export function writePersistentState<T>(key: string, value: T) {
  const serialized = JSON.stringify(value);
  localStorage.setItem(keyOf(key), serialized);
  cache.set(keyOf(key), { raw: serialized, value });
  emit(key);
}

export const patientDataKey = (id: string, key: string) =>
  id === "jose" ? key : `patient:${id}:${key}`;

function readCached<T>(key: string, initial: T): T {
  const fullKey = keyOf(key);
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(fullKey);
  } catch {
    raw = null;
  }
  const cached = cache.get(fullKey);
  if (cached && cached.raw === raw) return cached.value as T;
  let value: T;
  if (raw === null) {
    value = initial;
  } else {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = initial;
    }
  }
  cache.set(fullKey, { raw, value });
  return value;
}

// Sincronización entre pestañas abiertas del mismo origen.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key && event.key.startsWith(PREFIX)) {
      const key = event.key.slice(PREFIX.length);
      cache.delete(keyOf(key));
      emit(key);
    }
  });
}

/** Borra todos los datos de la app (solo este dispositivo). */
export function resetAllData() {
  try {
    const removed: string[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const fullKey = localStorage.key(index);
      if (fullKey && fullKey.startsWith(PREFIX)) removed.push(fullKey);
    }
    removed.forEach((fullKey) => localStorage.removeItem(fullKey));
  } catch {
    // Sin localStorage disponible: nada que borrar.
  }
  cache.clear();
  listeners.forEach((group) => group.forEach((listener) => listener()));
}

export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, (value: T | ((current: T) => T)) => void] {
  const patient = useContext(PatientScope);
  if (/^utility:completed:(medications|tasks)$/.test(key)) key += `:${todayISO()}`;
  if (isPatientKey(key) && patient !== "jose") {
    key = `patient:${patient}:${key}`;
    if (Array.isArray(initial)) initial = [] as T;
  }
  const subscribe = useCallback(
    (listener: Listener) => {
      const fullKey = keyOf(key);
      let group = listeners.get(fullKey);
      if (!group) {
        group = new Set();
        listeners.set(fullKey, group);
      }
      group.add(listener);
      return () => group.delete(listener);
    },
    [key],
  );

  const getSnapshot = useCallback(() => readCached<T>(key, initial), [key, initial]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setState = useCallback(
    (next: T | ((current: T) => T)) => {
      const current = readCached<T>(key, initial);
      const resolved = typeof next === "function" ? (next as (c: T) => T)(current) : next;
      if (resolved === current) return;
      try {
        const serialized = JSON.stringify(resolved);
        localStorage.setItem(keyOf(key), serialized);
        cache.set(keyOf(key), { raw: serialized, value: resolved });
      } catch {
        // localStorage lleno o no disponible: la app sigue funcionando en memoria.
        cache.set(keyOf(key), { raw: null, value: resolved });
      }
      emit(key);
    },
    [key, initial],
  );

  return [value, setState];
}

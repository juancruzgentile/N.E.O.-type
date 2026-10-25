// Canciones propias del usuario guardadas en IndexedDB (quedan en este navegador).
import type { UserTrack } from "./music";

const DB = "neontype-music";
const STORE = "tracks";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const req = fn(db.transaction(STORE, mode).objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export const loadTracks = () => tx<UserTrack[]>("readonly", (s) => s.getAll() as IDBRequest<UserTrack[]>).catch(() => []);

export async function addTracks(files: FileList | File[]): Promise<UserTrack[]> {
  for (const f of Array.from(files)) {
    if (!f.type.startsWith("audio/")) continue;
    const track: UserTrack = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name: f.name.replace(/\.[^.]+$/, ""), blob: f };
    await tx("readwrite", (s) => s.put(track));
  }
  return loadTracks();
}

export async function removeTrack(id: string): Promise<UserTrack[]> {
  await tx("readwrite", (s) => s.delete(id));
  return loadTracks();
}

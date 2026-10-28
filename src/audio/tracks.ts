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

/** Resuelve recién cuando la transacción se confirma (no al terminar la petición) y cierra la conexión. */
function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        let t: IDBTransaction;
        try {
          t = db.transaction(STORE, mode);
        } catch (e) {
          db.close();
          reject(e);
          return;
        }
        const req = fn(t.objectStore(STORE));
        t.oncomplete = () => {
          db.close();
          resolve(req.result);
        };
        t.onabort = t.onerror = () => {
          db.close();
          reject(t.error ?? req.error);
        };
      }),
  );
}

export const loadTracks = () =>
  tx<UserTrack[]>("readonly", (s) => s.getAll() as IDBRequest<UserTrack[]>)
    .then((list) => list.filter((t) => t && typeof t.id === "string" && typeof t.name === "string" && t.blob instanceof Blob))
    .catch(() => [] as UserTrack[]);

export const MAX_TRACK_BYTES = 40 * 1024 * 1024;
export const MAX_TRACKS = 50;
const AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/ogg", "audio/wav", "audio/x-wav", "audio/wave", "audio/webm", "audio/flac", "audio/aac", "audio/mp4", "audio/x-m4a"];

/** Agrega canciones. Devuelve la lista nueva y los archivos que se rechazaron (con el motivo). */
export async function addTracks(files: FileList | File[]): Promise<{ tracks: UserTrack[]; rejected: string[] }> {
  const rejected: string[] = [];
  let count = (await loadTracks()).length;
  for (const f of Array.from(files)) {
    if (!AUDIO_TYPES.includes(f.type)) {
      rejected.push(`${f.name}: formato no soportado`);
      continue;
    }
    if (f.size > MAX_TRACK_BYTES) {
      rejected.push(`${f.name}: supera los 40 MB`);
      continue;
    }
    if (count >= MAX_TRACKS) {
      rejected.push(`${f.name}: máximo ${MAX_TRACKS} canciones`);
      continue;
    }
    const name = f.name.replace(/\.[^.]+$/, "").replace(/[\u0000-\u001f\u202a-\u202e\u2066-\u2069]/g, "").slice(0, 80);
    const track: UserTrack = { id: crypto.randomUUID(), name, blob: f };
    try {
      await tx("readwrite", (s) => s.put(track));
      count++;
    } catch {
      rejected.push(`${f.name}: no hay espacio disponible en el navegador`);
    }
  }
  return { tracks: await loadTracks(), rejected };
}

export async function removeTrack(id: string): Promise<UserTrack[]> {
  await tx("readwrite", (s) => s.delete(id));
  return loadTracks();
}

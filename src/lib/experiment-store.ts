"use client";
import type { PopulationInput, PopulationResult } from "@/lib/population";

const DB_NAME = "synthora-population-v02";
const STORE = "experiments";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveLocal(result: PopulationResult) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(result);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function loadLocal(): Promise<PopulationResult[]> {
  const db = await openDb();
  const rows = await new Promise<PopulationResult[]>((resolve, reject) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as PopulationResult[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 30);
}

export async function saveExperiment(result: PopulationResult, input?: PopulationInput) {
  try {
    const response = await fetch("/api/research/experiments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result, input }),
    });
    if (!response.ok) throw new Error("Cloud save unavailable");
  } catch {
    // Keep the experiment usable offline; it will remain in this browser until cloud save succeeds.
  }
  await saveLocal(result);
}

export async function loadExperiments(): Promise<PopulationResult[]> {
  try {
    const response = await fetch("/api/research/experiments", { cache: "no-store" });
    if (response.ok) {
      const payload = await response.json() as { experiments?: PopulationResult[] };
      const cloudRows = Array.isArray(payload.experiments) ? payload.experiments : [];
      const localRows = await loadLocal().catch(() => []);
      const merged = new Map<string, PopulationResult>();
      [...localRows, ...cloudRows].forEach((row) => merged.set(row.id, row));
      return [...merged.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 30);
    }
  } catch {
    // Fall back to local history when the network or database is unavailable.
  }
  return loadLocal();
}

export async function deleteExperiment(id: string) {
  try {
    await fetch("/api/research/experiments?id=" + encodeURIComponent(id), { method: "DELETE" });
  } catch {
    // Local copy can still be removed while offline.
  }
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

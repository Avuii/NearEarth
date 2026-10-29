const storageKey = "nearearth-last-sync";
const listeners = new Set<() => void>();

function readSavedSync(): string | null {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved && Number.isFinite(Date.parse(saved)) ? saved : null;
  } catch {
    return null;
  }
}

let lastSyncedAtUtc = readSavedSync();

export function getLastSyncedAtUtc() {
  return lastSyncedAtUtc;
}

export function subscribeToDataSync(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function recordDataSync(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return;
  if (lastSyncedAtUtc && timestamp <= Date.parse(lastSyncedAtUtc)) return;

  lastSyncedAtUtc = new Date(timestamp).toISOString();
  try {
    localStorage.setItem(storageKey, lastSyncedAtUtc);
  } catch {
    // The current session still shows the sync time when storage is unavailable.
  }
  listeners.forEach((listener) => listener());
}

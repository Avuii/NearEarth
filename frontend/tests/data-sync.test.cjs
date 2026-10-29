const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function loadSync(saved = null, blocked = false) {
  const values = new Map(saved ? [["nearearth-last-sync", saved]] : []);
  const exports = {};
  const source = readFileSync(path.join(__dirname, "../src/lib/data-sync.ts"), "utf8");
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    exports,
    localStorage: {
      getItem(key) { if (blocked) throw Error("Unavailable"); return values.get(key) ?? null; },
      setItem(key, value) { if (blocked) throw Error("Unavailable"); values.set(key, value); },
    },
  });
  return { sync: exports, values };
}

test("no sync is displayed until a successful response supplies a timestamp", () => {
  const { sync } = loadSync();
  assert.equal(sync.getLastSyncedAtUtc(), null);
  sync.recordDataSync(undefined);
  sync.recordDataSync("invalid");
  assert.equal(sync.getLastSyncedAtUtc(), null);
});

test("successful sync updates subscribers and persists across reloads", () => {
  const { sync, values } = loadSync();
  let updates = 0;
  const unsubscribe = sync.subscribeToDataSync(() => updates++);
  sync.recordDataSync("2026-10-29T21:00:00Z");
  assert.equal(updates, 1);
  const stored = values.get("nearearth-last-sync");
  assert.equal(stored, "2026-10-29T21:00:00.000Z");
  assert.equal(loadSync(stored).sync.getLastSyncedAtUtc(), stored);
  unsubscribe();
  sync.recordDataSync("2026-10-29T22:00:00Z");
  assert.equal(updates, 1);
});

test("cached or older data does not change the last successful sync", () => {
  const timestamp = "2026-10-29T21:00:00.000Z";
  const { sync } = loadSync(timestamp);
  let updates = 0;
  sync.subscribeToDataSync(() => updates++);
  sync.recordDataSync(timestamp);
  sync.recordDataSync("2026-10-29T20:00:00Z");
  assert.equal(sync.getLastSyncedAtUtc(), timestamp);
  assert.equal(updates, 0);
});

test("blocked storage still allows the current session to show sync time", () => {
  const { sync } = loadSync(null, true);
  sync.recordDataSync("2026-10-29T21:00:00Z");
  assert.equal(sync.getLastSyncedAtUtc(), "2026-10-29T21:00:00.000Z");
});

test("invalid saved timestamps are ignored", () => {
  assert.equal(loadSync("invalid").sync.getLastSyncedAtUtc(), null);
});

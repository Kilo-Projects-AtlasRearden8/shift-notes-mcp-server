"use strict";

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const STORE_PATH = path.join(DATA_DIR, "shift-notes.json");

const EDUCATION_DISCLAIMER =
  "Education only. This tool is not medical advice and is not a substitute for clinical judgment, facility policy, or licensed professional care. Do not include patient names, identifiers, or protected health information.";

const TASK_TYPES = [
  "medication",
  "procedure",
  "assessment",
  "documentation",
  "communication",
  "other",
];

const TASK_STATUSES = ["pending", "in-progress", "completed", "deferred"];

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify({ entries: [] }, null, 2));
  }
}

function readStore() {
  ensureStore();
  const raw = fs.readFileSync(STORE_PATH, "utf8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    return { entries: [] };
  }
}

function writeStore(store) {
  ensureStore();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

function nowIso() {
  return new Date().toISOString();
}

function defaultShiftId() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `shift-${y}-${m}-${day}`;
}

function sanitizeString(value) {
  if (typeof value !== "string") return String(value);
  return value.trim();
}

function appendEntry(type, fields) {
  const store = readStore();
  const entry = {
    ...fields,
    id: `${type}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    type,
    timestamp: fields.timestamp || nowIso(),
    shiftId: fields.shiftId || defaultShiftId(),
  };
  store.entries.push(entry);
  writeStore(store);
  return entry;
}

function getEntriesByShift(shiftId) {
  const store = readStore();
  if (shiftId) {
    return store.entries.filter((e) => e.shiftId === shiftId);
  }
  return store.entries;
}

module.exports = {
  DATA_DIR,
  STORE_PATH,
  EDUCATION_DISCLAIMER,
  TASK_TYPES,
  TASK_STATUSES,
  ensureStore,
  readStore,
  writeStore,
  nowIso,
  defaultShiftId,
  sanitizeString,
  appendEntry,
  getEntriesByShift,
};

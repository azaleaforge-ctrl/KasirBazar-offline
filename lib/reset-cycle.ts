import { clearTransactions, getSettings, setSetting } from "./db";

const DAY_MS = 24 * 60 * 60 * 1000;
export const CYCLE_MS = 30 * DAY_MS;
const WARN_MS = 5 * DAY_MS;
const CRIT_MS = 1 * DAY_MS;

export type ResetStatus = "hidden" | "warn" | "critical";

export interface ResetInfo {
  status: ResetStatus;
  msLeft: number;
  nextReset: number;
  cycleStart: number;
  label: string;
}

// Anchor the 30-day cycle to first use; persists in settings.
async function getAnchor(): Promise<number> {
  const settings = await getSettings();
  const raw = settings["cycleAnchor"];
  if (typeof raw === "number" && raw > 0) return raw;
  const now = Date.now();
  await setSetting("cycleAnchor", now);
  await setSetting("lastClearedCycle", 0);
  return now;
}

async function getLastCleared(): Promise<number> {
  const settings = await getSettings();
  const raw = settings["lastClearedCycle"];
  return typeof raw === "number" ? raw : 0;
}

function buildLabel(msLeft: number): string {
  if (msLeft <= 0) return "Reset otomatis sekarang";
  if (msLeft <= DAY_MS) {
    const h = Math.max(1, Math.ceil(msLeft / (60 * 60 * 1000)));
    return `Reset otomatis dalam ${h} jam`;
  }
  const d = Math.ceil(msLeft / DAY_MS);
  return `Reset otomatis dalam ${d} hari`;
}

export async function getResetInfo(now: number = Date.now()): Promise<ResetInfo> {
  const anchor = await getAnchor();
  const cycleIndex = Math.floor((now - anchor) / CYCLE_MS);
  const cycleStart = anchor + cycleIndex * CYCLE_MS;
  const nextReset = cycleStart + CYCLE_MS;
  const msLeft = nextReset - now;
  let status: ResetStatus = "hidden";
  if (msLeft <= CRIT_MS) status = "critical";
  else if (msLeft <= WARN_MS) status = "warn";
  return { status, msLeft, nextReset, cycleStart, label: buildLabel(msLeft) };
}

// Run once on app load: clear transactions when a new 30-day cycle begins.
export async function performCycleCheck(now: number = Date.now()): Promise<boolean> {
  const anchor = await getAnchor();
  const cycleIndex = Math.floor((now - anchor) / CYCLE_MS);
  if (cycleIndex <= 0) return false;
  const last = await getLastCleared();
  if (cycleIndex === last) return false;
  await clearTransactions();
  await setSetting("lastClearedCycle", cycleIndex);
  return true;
}

// Manual reset: wipe transactions now and restart the 30-day cycle.
export async function manualReset(): Promise<void> {
  await clearTransactions();
  const now = Date.now();
  await setSetting("cycleAnchor", now);
  await setSetting("lastClearedCycle", 0);
}

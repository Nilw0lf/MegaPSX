import { db } from "@/lib/db";
import type {
  DividendScenario,
  FeeProfile,
  SellScenario,
  TaxProfile
} from "@/types/models";

const LOCAL_KEY = "megapx-data";

export interface AppStorageSnapshot {
  dividendScenarios: DividendScenario[];
  sellScenarios: SellScenario[];
  taxProfiles: TaxProfile[];
  feeProfiles: FeeProfile[];
}

const emptySnapshot: AppStorageSnapshot = {
  dividendScenarios: [],
  sellScenarios: [],
  taxProfiles: [],
  feeProfiles: []
};

export async function loadSnapshot(): Promise<AppStorageSnapshot> {
  if (db) {
    try {
      const [dividendScenarios, sellScenarios, taxProfiles, feeProfiles] =
        await Promise.all([
          db.dividendScenarios.toArray(),
          db.sellScenarios.toArray(),
          db.taxProfiles.toArray(),
          db.feeProfiles.toArray()
        ]);
      return { dividendScenarios, sellScenarios, taxProfiles, feeProfiles };
    } catch (error) {
      console.warn("Dexie unavailable, falling back to localStorage", error);
    }
  }

  if (typeof window === "undefined") {
    return emptySnapshot;
  }

  const raw = window.localStorage.getItem(LOCAL_KEY);
  if (!raw) {
    return emptySnapshot;
  }
  try {
    return JSON.parse(raw) as AppStorageSnapshot;
  } catch (error) {
    console.warn("Failed to parse local storage data", error);
    return emptySnapshot;
  }
}

export async function saveSnapshot(snapshot: AppStorageSnapshot) {
  if (db) {
    try {
      await db.transaction("rw", db.dividendScenarios, db.sellScenarios, db.taxProfiles, db.feeProfiles, async () => {
        await Promise.all([
          db.dividendScenarios.clear(),
          db.sellScenarios.clear(),
          db.taxProfiles.clear(),
          db.feeProfiles.clear()
        ]);
        await Promise.all([
          db.dividendScenarios.bulkAdd(snapshot.dividendScenarios),
          db.sellScenarios.bulkAdd(snapshot.sellScenarios),
          db.taxProfiles.bulkAdd(snapshot.taxProfiles),
          db.feeProfiles.bulkAdd(snapshot.feeProfiles)
        ]);
      });
      return;
    } catch (error) {
      console.warn("Dexie save failed, falling back to localStorage", error);
    }
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(snapshot));
  }
}

export async function resetStorage() {
  if (db) {
    try {
      await Promise.all([
        db.dividendScenarios.clear(),
        db.sellScenarios.clear(),
        db.taxProfiles.clear(),
        db.feeProfiles.clear()
      ]);
    } catch (error) {
      console.warn("Dexie reset failed", error);
    }
  }
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(LOCAL_KEY);
  }
}

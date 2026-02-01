import Dexie, { type Table } from "dexie";
import type {
  DividendScenario,
  FeeProfile,
  SellScenario,
  TaxProfile
} from "@/types/models";

export class MegaPXDatabase extends Dexie {
  dividendScenarios!: Table<DividendScenario, string>;
  sellScenarios!: Table<SellScenario, string>;
  taxProfiles!: Table<TaxProfile, string>;
  feeProfiles!: Table<FeeProfile, string>;

  constructor() {
    super("megapx-db");
    this.version(1).stores({
      dividendScenarios: "id, updatedAt",
      sellScenarios: "id, updatedAt",
      taxProfiles: "id, updatedAt",
      feeProfiles: "id, updatedAt"
    });
  }
}

export const db = typeof window !== "undefined" ? new MegaPXDatabase() : null;

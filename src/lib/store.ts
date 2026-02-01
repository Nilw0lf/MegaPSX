"use client";

import { create } from "zustand";
import { z } from "zod";
import type {
  DividendScenario,
  FeeProfile,
  SellScenario,
  TaxProfile
} from "@/types/models";
import { loadSnapshot, resetStorage, saveSnapshot } from "@/lib/storage";

const currencyDefault = "PKR";

const dividendScenarioSchema = z.object({
  label: z.string().min(1),
  tickerOrName: z.string().min(1),
  shares: z.number().positive(),
  buyPrice: z.number().positive(),
  currentPrice: z.number().positive(),
  dividendPerShare: z.number().positive(),
  dividendFrequency: z.enum([
    "One-time",
    "Quarterly",
    "Semiannual",
    "Annual",
    "Custom"
  ]),
  customDistributionsPerYear: z.number().positive().optional(),
  taxProfileId: z.string().min(1)
});

const sellScenarioSchema = z.object({
  label: z.string().min(1),
  tickerOrName: z.string().min(1),
  quantity: z.number().positive(),
  buyPrice: z.number().positive(),
  sellPrice: z.number().positive(),
  buyDate: z.string().min(1),
  sellDate: z.string().min(1),
  taxProfileId: z.string().min(1),
  feeProfileId: z.string().min(1)
});

const taxProfileSchema = z.object({
  name: z.string().min(1),
  dividendWithholdingRate: z.number().nonnegative(),
  cgtRules: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        minDays: z.number().nonnegative(),
        maxDays: z.number().nullable(),
        rate: z.number().nonnegative()
      })
    )
    .min(1)
});

const feeProfileSchema = z.object({
  name: z.string().min(1),
  fees: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      type: z.enum(["percent_of_trade_value", "fixed"]),
      value: z.number().nonnegative(),
      applyOn: z.enum(["buy", "sell", "both"]),
      notes: z.string().optional()
    })
  )
});

const nowIso = () => new Date().toISOString();

const generateId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Math.random().toString(16).slice(2)}`;

const seedTaxProfile: TaxProfile = {
  id: generateId(),
  name: "Edit these (Sample)",
  dividendWithholdingRate: 5,
  cgtRules: [
    {
      id: generateId(),
      label: "0–365 days",
      minDays: 0,
      maxDays: 365,
      rate: 10
    },
    {
      id: generateId(),
      label: "366+ days",
      minDays: 366,
      maxDays: null,
      rate: 5
    }
  ],
  createdAt: nowIso(),
  updatedAt: nowIso()
};

const seedFeeProfile: FeeProfile = {
  id: generateId(),
  name: "Edit these (Sample)",
  fees: [
    {
      id: generateId(),
      label: "Broker commission",
      type: "percent_of_trade_value",
      value: 0.5,
      applyOn: "sell",
      notes: "Placeholder fee"
    },
    {
      id: generateId(),
      label: "Exchange fee",
      type: "fixed",
      value: 150,
      applyOn: "sell",
      notes: "Placeholder fee"
    }
  ],
  createdAt: nowIso(),
  updatedAt: nowIso()
};

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
}

interface AppState {
  loaded: boolean;
  dividendScenarios: DividendScenario[];
  sellScenarios: SellScenario[];
  taxProfiles: TaxProfile[];
  feeProfiles: FeeProfile[];
  toasts: ToastMessage[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  load: () => Promise<void>;
  addDividendScenario: (input: Omit<DividendScenario, "id" | "createdAt" | "updatedAt" | "currency">) => void;
  addSellScenario: (input: Omit<SellScenario, "id" | "createdAt" | "updatedAt" | "currency">) => void;
  updateDividendScenario: (scenario: DividendScenario) => void;
  updateSellScenario: (scenario: SellScenario) => void;
  addTaxProfile: (input: Omit<TaxProfile, "id" | "createdAt" | "updatedAt">) => void;
  updateTaxProfile: (profile: TaxProfile) => void;
  addFeeProfile: (input: Omit<FeeProfile, "id" | "createdAt" | "updatedAt">) => void;
  updateFeeProfile: (profile: FeeProfile) => void;
  deleteTaxProfile: (id: string) => void;
  deleteFeeProfile: (id: string) => void;
  deleteScenario: (type: "dividend" | "sell", id: string) => void;
  togglePinned: (type: "dividend" | "sell", id: string) => void;
  pushToast: (toast: Omit<ToastMessage, "id">) => void;
  popToast: (id: string) => void;
  exportData: () => string;
  importData: (raw: string) => void;
  resetAll: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  loaded: false,
  dividendScenarios: [],
  sellScenarios: [],
  taxProfiles: [],
  feeProfiles: [],
  toasts: [],
  searchQuery: "",
  setSearchQuery: (value) => set({ searchQuery: value }),
  load: async () => {
    const snapshot = await loadSnapshot();
    set({
      loaded: true,
      dividendScenarios: snapshot.dividendScenarios,
      sellScenarios: snapshot.sellScenarios,
      taxProfiles:
        snapshot.taxProfiles.length > 0 ? snapshot.taxProfiles : [seedTaxProfile],
      feeProfiles:
        snapshot.feeProfiles.length > 0 ? snapshot.feeProfiles : [seedFeeProfile]
    });
  },
  addDividendScenario: (input) => {
    const parsed = dividendScenarioSchema.safeParse(input);
    if (!parsed.success) {
      get().pushToast({
        title: "Scenario not saved",
        description: "Please fill out all required dividend fields."
      });
      return;
    }
    const now = nowIso();
    const scenario: DividendScenario = {
      ...parsed.data,
      id: generateId(),
      currency: currencyDefault,
      pinned: false,
      createdAt: now,
      updatedAt: now
    };
    set((state) => ({
      dividendScenarios: [scenario, ...state.dividendScenarios]
    }));
    get().pushToast({ title: "Dividend scenario saved" });
    saveSnapshot({
      dividendScenarios: [scenario, ...get().dividendScenarios],
      sellScenarios: get().sellScenarios,
      taxProfiles: get().taxProfiles,
      feeProfiles: get().feeProfiles
    });
  },
  updateDividendScenario: (scenario) => {
    const parsed = dividendScenarioSchema.safeParse({
      label: scenario.label,
      tickerOrName: scenario.tickerOrName,
      shares: scenario.shares,
      buyPrice: scenario.buyPrice,
      currentPrice: scenario.currentPrice,
      dividendPerShare: scenario.dividendPerShare,
      dividendFrequency: scenario.dividendFrequency,
      customDistributionsPerYear: scenario.customDistributionsPerYear,
      taxProfileId: scenario.taxProfileId
    });
    if (!parsed.success) {
      get().pushToast({
        title: "Scenario invalid",
        description: "Please check required dividend fields."
      });
      return;
    }
    const updated = { ...scenario, updatedAt: nowIso() };
    const next = get().dividendScenarios.map((item) =>
      item.id === scenario.id ? updated : item
    );
    set({ dividendScenarios: next });
    saveSnapshot({
      dividendScenarios: next,
      sellScenarios: get().sellScenarios,
      taxProfiles: get().taxProfiles,
      feeProfiles: get().feeProfiles
    });
    get().pushToast({ title: "Dividend scenario updated" });
  },
  addSellScenario: (input) => {
    const parsed = sellScenarioSchema.safeParse(input);
    if (!parsed.success) {
      get().pushToast({
        title: "Scenario not saved",
        description: "Please fill out all required sell fields."
      });
      return;
    }
    const now = nowIso();
    const scenario: SellScenario = {
      ...parsed.data,
      id: generateId(),
      currency: currencyDefault,
      pinned: false,
      createdAt: now,
      updatedAt: now
    };
    set((state) => ({
      sellScenarios: [scenario, ...state.sellScenarios]
    }));
    get().pushToast({ title: "Sell scenario saved" });
    saveSnapshot({
      dividendScenarios: get().dividendScenarios,
      sellScenarios: [scenario, ...get().sellScenarios],
      taxProfiles: get().taxProfiles,
      feeProfiles: get().feeProfiles
    });
  },
  updateSellScenario: (scenario) => {
    const parsed = sellScenarioSchema.safeParse({
      label: scenario.label,
      tickerOrName: scenario.tickerOrName,
      quantity: scenario.quantity,
      buyPrice: scenario.buyPrice,
      sellPrice: scenario.sellPrice,
      buyDate: scenario.buyDate,
      sellDate: scenario.sellDate,
      taxProfileId: scenario.taxProfileId,
      feeProfileId: scenario.feeProfileId
    });
    if (!parsed.success) {
      get().pushToast({
        title: "Scenario invalid",
        description: "Please check required sell fields."
      });
      return;
    }
    const updated = { ...scenario, updatedAt: nowIso() };
    const next = get().sellScenarios.map((item) =>
      item.id === scenario.id ? updated : item
    );
    set({ sellScenarios: next });
    saveSnapshot({
      dividendScenarios: get().dividendScenarios,
      sellScenarios: next,
      taxProfiles: get().taxProfiles,
      feeProfiles: get().feeProfiles
    });
    get().pushToast({ title: "Sell scenario updated" });
  },
  addTaxProfile: (input) => {
    const parsed = taxProfileSchema.safeParse(input);
    if (!parsed.success) {
      get().pushToast({
        title: "Tax profile invalid",
        description: "Check the fields and CGT slabs."
      });
      return;
    }
    const now = nowIso();
    const profile: TaxProfile = {
      ...parsed.data,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    set((state) => ({ taxProfiles: [profile, ...state.taxProfiles] }));
    saveSnapshot({
      dividendScenarios: get().dividendScenarios,
      sellScenarios: get().sellScenarios,
      taxProfiles: [profile, ...get().taxProfiles],
      feeProfiles: get().feeProfiles
    });
    get().pushToast({ title: "Tax profile saved" });
  },
  updateTaxProfile: (profile) => {
    const parsed = taxProfileSchema.safeParse(profile);
    if (!parsed.success) {
      get().pushToast({
        title: "Tax profile invalid",
        description: "Check the fields and CGT slabs."
      });
      return;
    }
    const updated = { ...profile, updatedAt: nowIso() };
    set((state) => ({
      taxProfiles: state.taxProfiles.map((item) =>
        item.id === profile.id ? updated : item
      )
    }));
    saveSnapshot({
      dividendScenarios: get().dividendScenarios,
      sellScenarios: get().sellScenarios,
      taxProfiles: get().taxProfiles.map((item) =>
        item.id === profile.id ? updated : item
      ),
      feeProfiles: get().feeProfiles
    });
    get().pushToast({ title: "Tax profile updated" });
  },
  addFeeProfile: (input) => {
    const parsed = feeProfileSchema.safeParse(input);
    if (!parsed.success) {
      get().pushToast({
        title: "Fee profile invalid",
        description: "Check the fee items."
      });
      return;
    }
    const now = nowIso();
    const profile: FeeProfile = {
      ...parsed.data,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    set((state) => ({ feeProfiles: [profile, ...state.feeProfiles] }));
    saveSnapshot({
      dividendScenarios: get().dividendScenarios,
      sellScenarios: get().sellScenarios,
      taxProfiles: get().taxProfiles,
      feeProfiles: [profile, ...get().feeProfiles]
    });
    get().pushToast({ title: "Fee profile saved" });
  },
  updateFeeProfile: (profile) => {
    const parsed = feeProfileSchema.safeParse(profile);
    if (!parsed.success) {
      get().pushToast({
        title: "Fee profile invalid",
        description: "Check the fee items."
      });
      return;
    }
    const updated = { ...profile, updatedAt: nowIso() };
    set((state) => ({
      feeProfiles: state.feeProfiles.map((item) =>
        item.id === profile.id ? updated : item
      )
    }));
    saveSnapshot({
      dividendScenarios: get().dividendScenarios,
      sellScenarios: get().sellScenarios,
      taxProfiles: get().taxProfiles,
      feeProfiles: get().feeProfiles.map((item) =>
        item.id === profile.id ? updated : item
      )
    });
    get().pushToast({ title: "Fee profile updated" });
  },
  deleteTaxProfile: (id) => {
    set((state) => ({
      taxProfiles: state.taxProfiles.filter((item) => item.id !== id)
    }));
    saveSnapshot({
      dividendScenarios: get().dividendScenarios,
      sellScenarios: get().sellScenarios,
      taxProfiles: get().taxProfiles.filter((item) => item.id !== id),
      feeProfiles: get().feeProfiles
    });
    get().pushToast({ title: "Tax profile deleted" });
  },
  deleteFeeProfile: (id) => {
    set((state) => ({
      feeProfiles: state.feeProfiles.filter((item) => item.id !== id)
    }));
    saveSnapshot({
      dividendScenarios: get().dividendScenarios,
      sellScenarios: get().sellScenarios,
      taxProfiles: get().taxProfiles,
      feeProfiles: get().feeProfiles.filter((item) => item.id !== id)
    });
    get().pushToast({ title: "Fee profile deleted" });
  },
  deleteScenario: (type, id) => {
    if (type === "dividend") {
      const next = get().dividendScenarios.filter((item) => item.id !== id);
      set({ dividendScenarios: next });
      saveSnapshot({
        dividendScenarios: next,
        sellScenarios: get().sellScenarios,
        taxProfiles: get().taxProfiles,
        feeProfiles: get().feeProfiles
      });
    } else {
      const next = get().sellScenarios.filter((item) => item.id !== id);
      set({ sellScenarios: next });
      saveSnapshot({
        dividendScenarios: get().dividendScenarios,
        sellScenarios: next,
        taxProfiles: get().taxProfiles,
        feeProfiles: get().feeProfiles
      });
    }
    get().pushToast({ title: "Scenario deleted" });
  },
  togglePinned: (type, id) => {
    if (type === "dividend") {
      const next = get().dividendScenarios.map((item) =>
        item.id === id ? { ...item, pinned: !item.pinned, updatedAt: nowIso() } : item
      );
      set({ dividendScenarios: next });
      saveSnapshot({
        dividendScenarios: next,
        sellScenarios: get().sellScenarios,
        taxProfiles: get().taxProfiles,
        feeProfiles: get().feeProfiles
      });
    } else {
      const next = get().sellScenarios.map((item) =>
        item.id === id ? { ...item, pinned: !item.pinned, updatedAt: nowIso() } : item
      );
      set({ sellScenarios: next });
      saveSnapshot({
        dividendScenarios: get().dividendScenarios,
        sellScenarios: next,
        taxProfiles: get().taxProfiles,
        feeProfiles: get().feeProfiles
      });
    }
    get().pushToast({ title: "Pinned state updated" });
  },
  pushToast: (toast) => {
    const newToast: ToastMessage = { id: generateId(), ...toast };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    setTimeout(() => {
      get().popToast(newToast.id);
    }, 2200);
  },
  popToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  exportData: () => {
    const snapshot = {
      dividendScenarios: get().dividendScenarios,
      sellScenarios: get().sellScenarios,
      taxProfiles: get().taxProfiles,
      feeProfiles: get().feeProfiles
    };
    return JSON.stringify(snapshot, null, 2);
  },
  importData: (raw) => {
    try {
      const parsed = JSON.parse(raw) as {
        dividendScenarios: DividendScenario[];
        sellScenarios: SellScenario[];
        taxProfiles: TaxProfile[];
        feeProfiles: FeeProfile[];
      };
      const merged = {
        dividendScenarios: mergeByUpdated(
          get().dividendScenarios,
          parsed.dividendScenarios || []
        ),
        sellScenarios: mergeByUpdated(
          get().sellScenarios,
          parsed.sellScenarios || []
        ),
        taxProfiles: mergeByUpdated(get().taxProfiles, parsed.taxProfiles || []),
        feeProfiles: mergeByUpdated(get().feeProfiles, parsed.feeProfiles || [])
      };
      set(merged);
      saveSnapshot(merged);
      get().pushToast({ title: "Data imported" });
    } catch (error) {
      console.error(error);
      get().pushToast({
        title: "Import failed",
        description: "Check your JSON format."
      });
    }
  },
  resetAll: async () => {
    await resetStorage();
    set({
      dividendScenarios: [],
      sellScenarios: [],
      taxProfiles: [seedTaxProfile],
      feeProfiles: [seedFeeProfile]
    });
    get().pushToast({ title: "Local data reset" });
  }
}));

function mergeByUpdated<T extends { id: string; updatedAt: string }>(
  current: T[],
  incoming: T[]
) {
  const map = new Map(current.map((item) => [item.id, item]));
  incoming.forEach((item) => {
    const existing = map.get(item.id);
    if (!existing || new Date(item.updatedAt) > new Date(existing.updatedAt)) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
}

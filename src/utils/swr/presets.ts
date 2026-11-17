import { CMA } from "@/utils/allocations";
import { SUCCESS_RATE_PRESETS } from "@/utils/retirement/presets";

export { SUCCESS_RATE_PRESETS };

/** Horizons (years) shown as table columns. */
export const SWR_HORIZONS = [20, 25, 30, 35, 40, 45, 50] as const;

/** Simulated paths per table (shared by every allocation). */
export const SWR_PATHS = 10_000;

/**
 * Dynamics of the pooled JST history (16 countries, 1871-2020) that the historical model keeps:
 * the same-year stock-bond correlation and each asset's 10-year variance ratio. Shown on the page;
 * a test checks them against the bundled data.
 */
export const HISTORY_DYNAMICS = { correlation: 0.29, stockVr: 0.91, bondVr: 2.66 } as const;

/**
 * Default numeric inputs. Returns and volatilities are nominal geometric (compound) percentages.
 */
export const DEFAULTS = {
  stockReturn: CMA.stockReturn,
  stockVol: CMA.stockVol,
  bondReturn: CMA.bondReturn,
  bondVol: CMA.bondVol,
  correlation: CMA.correlation,
  inflationRate: 2.1,
  /** Target % of simulated markets the withdrawal must survive. */
  successRate: 90,
  /** 10-year variance ratios. 1 = independent years; below 1 mean reversion, above 1 persistence. */
  stockVr: 0.9,
  bondVr: 1.5,
} as const;

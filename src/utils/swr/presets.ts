import { SUCCESS_RATE_PRESETS } from "@/utils/retirement/presets";

export { SUCCESS_RATE_PRESETS };

/** Horizons (years) shown as table columns. */
export const SWR_HORIZONS = [20, 25, 30, 35, 40, 45, 50] as const;

/** Simulated paths per table (shared by every allocation). */
export const SWR_PATHS = 10_000;

/**
 * Default numeric inputs. Returns and volatilities are nominal geometric (compound) percentages.
 */
export const DEFAULTS = {
  stockReturn: 6.4,
  stockVol: 12,
  bondReturn: 3.8,
  bondVol: 4.5,
  correlation: 0.3,
  inflationRate: 2.1,
  /** Target % of simulated markets the withdrawal must survive. */
  successRate: 90,
  /** 10-year variance ratios. 1 = independent years; below 1 mean reversion, above 1 persistence. */
  stockVr: 0.9,
  bondVr: 1.5,
} as const;

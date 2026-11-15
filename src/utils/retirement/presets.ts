/**
 * Plan-confidence presets: the target % of simulated markets the plan must
 * survive. The engine returns the earliest retirement age that hits the target.
 */
export const SUCCESS_RATE_PRESETS = [80, 85, 90, 95, 99] as const;

import { arithmeticToGeometric, geometricToArithmetic } from "@/utils/returns";

/**
 * Capital market assumptions behind the return presets: nominal geometric (compound) return and
 * volatility per asset, and the stock-bond correlation.
 */
export const CMA = {
  stockReturn: 6.4,
  stockVol: 12,
  bondReturn: 3.8,
  bondVol: 4.5,
  correlation: 0.3,
} as const;

/**
 * Nominal geometric return and volatility (%, 2 decimals) of a yearly rebalanced stock/bond mix.
 * The arithmetic means blend linearly, the variance uses the correlation, and the blended
 * arithmetic mean is converted back to a geometric return.
 */
export function blendAllocation(equityPct: number): { returnPct: number; volatility: number } {
  const w = equityPct / 100;
  const stockVol = CMA.stockVol / 100;
  const bondVol = CMA.bondVol / 100;
  const arithmetic =
    w * geometricToArithmetic(CMA.stockReturn / 100, stockVol) +
    (1 - w) * geometricToArithmetic(CMA.bondReturn / 100, bondVol);
  const vol = Math.sqrt(
    (w * stockVol) ** 2 +
      ((1 - w) * bondVol) ** 2 +
      2 * CMA.correlation * w * (1 - w) * stockVol * bondVol,
  );
  const round2 = (x: number) => Math.round(x * 10000) / 100;
  return { returnPct: round2(arithmeticToGeometric(arithmetic, vol)), volatility: round2(vol) };
}

const ALLOCATIONS = {
  "100/0": blendAllocation(100),
  "90/10": blendAllocation(90),
  "80/20": blendAllocation(80),
  "70/30": blendAllocation(70),
  "60/40": blendAllocation(60),
  "50/50": blendAllocation(50),
  "40/60": blendAllocation(40),
  "30/70": blendAllocation(30),
  "20/80": blendAllocation(20),
  "10/90": blendAllocation(10),
  "0/100": blendAllocation(0),
} as const;

export const RETURN_PRESETS = [
  {
    id: "glide-path-80-20-to-60-40",
    label: "80/20 to 60/40",
    accumReturn: ALLOCATIONS["80/20"].returnPct,
    accumVolatility: ALLOCATIONS["80/20"].volatility,
    retireReturn: ALLOCATIONS["60/40"].returnPct,
    retireVolatility: ALLOCATIONS["60/40"].volatility,
  },
  {
    id: "glide-path-80-20-to-40-60",
    label: "80/20 to 40/60",
    accumReturn: ALLOCATIONS["80/20"].returnPct,
    accumVolatility: ALLOCATIONS["80/20"].volatility,
    retireReturn: ALLOCATIONS["40/60"].returnPct,
    retireVolatility: ALLOCATIONS["40/60"].volatility,
  },
  {
    id: "glide-path-100-0-to-80-20",
    label: "100/0 to 80/20",
    accumReturn: ALLOCATIONS["100/0"].returnPct,
    accumVolatility: ALLOCATIONS["100/0"].volatility,
    retireReturn: ALLOCATIONS["80/20"].returnPct,
    retireVolatility: ALLOCATIONS["80/20"].volatility,
  },
  {
    id: "glide-path-100-0-to-60-40",
    label: "100/0 to 60/40",
    accumReturn: ALLOCATIONS["100/0"].returnPct,
    accumVolatility: ALLOCATIONS["100/0"].volatility,
    retireReturn: ALLOCATIONS["60/40"].returnPct,
    retireVolatility: ALLOCATIONS["60/40"].volatility,
  },
  {
    id: "glide-path-100-0-to-40-60",
    label: "100/0 to 40/60",
    accumReturn: ALLOCATIONS["100/0"].returnPct,
    accumVolatility: ALLOCATIONS["100/0"].volatility,
    retireReturn: ALLOCATIONS["40/60"].returnPct,
    retireVolatility: ALLOCATIONS["40/60"].volatility,
  },
  {
    id: "glide-path-100-0",
    label: "100/0",
    accumReturn: ALLOCATIONS["100/0"].returnPct,
    accumVolatility: ALLOCATIONS["100/0"].volatility,
    retireReturn: ALLOCATIONS["100/0"].returnPct,
    retireVolatility: ALLOCATIONS["100/0"].volatility,
  },
  {
    id: "glide-path-80-20",
    label: "80/20",
    accumReturn: ALLOCATIONS["80/20"].returnPct,
    accumVolatility: ALLOCATIONS["80/20"].volatility,
    retireReturn: ALLOCATIONS["80/20"].returnPct,
    retireVolatility: ALLOCATIONS["80/20"].volatility,
  },
  {
    id: "glide-path-60-40",
    label: "60/40",
    accumReturn: ALLOCATIONS["60/40"].returnPct,
    accumVolatility: ALLOCATIONS["60/40"].volatility,
    retireReturn: ALLOCATIONS["60/40"].returnPct,
    retireVolatility: ALLOCATIONS["60/40"].volatility,
  },
] as const;

/**
 * Stock/bond mixes shown in the SWR technical-note reference table, with their
 * nominal geometric (compound) return and volatility (%). These mirror the return-preset
 * values and span the allocation axis users recognize.
 */
export const SWR_TABLE_ALLOCATIONS = [
  { label: "100/0", ...ALLOCATIONS["100/0"] },
  { label: "90/10", ...ALLOCATIONS["90/10"] },
  { label: "80/20", ...ALLOCATIONS["80/20"] },
  { label: "70/30", ...ALLOCATIONS["70/30"] },
  { label: "60/40", ...ALLOCATIONS["60/40"] },
  { label: "50/50", ...ALLOCATIONS["50/50"] },
  { label: "40/60", ...ALLOCATIONS["40/60"] },
  { label: "30/70", ...ALLOCATIONS["30/70"] },
  { label: "20/80", ...ALLOCATIONS["20/80"] },
  { label: "10/90", ...ALLOCATIONS["10/90"] },
  { label: "0/100", ...ALLOCATIONS["0/100"] },
] as const;

/** Retirement horizons (years) shown as columns in the SWR reference table. */
export const SWR_TABLE_HORIZONS = [20, 25, 30, 35, 40, 45, 50] as const;

/**
 * Default numeric inputs for the retirement planner. Rates are stored as
 * percentages. Dollar amounts are in today's dollars.
 */
export const DEFAULTS = {
  currentAge: 35,
  planningAge: 95,
  currentSavings: 200000,
  currentIncome: 100000,
  /** Annual savings rate, as a % of current income. 15% of $100k = $15k/yr. */
  contributionPct: 20,
  /** Target gross retirement income, as a % of current income (replacement ratio). */
  targetIncomePct: 60,
  /**
   * CPP you'd receive starting at 65, real $/yr (from your My Service Canada statement).
   * 11,100 + 8,900 OAS keeps the old $20k-at-65 default.
   */
  cppAt65: 11100,
  /** CPP start age, 60–70; the amount is adjusted −7.2%/yr before 65 and +8.4%/yr after. */
  cppStartAge: 65,
  /** OAS at 65, real $/yr (roughly the full amount for 65–74, ~$8,900 in 2026). */
  oasAt65: 8900,
  /** OAS start age, 65–70; +7.2%/yr for each year deferred. */
  oasStartAge: 65,
  /** Workplace (DB) or other guaranteed pension, as a % of income. Gross/taxable. */
  guaranteedIncomePct: 0,
  /** Age the workplace pension starts. */
  pensionStartAge: 65,
  /** Expected nominal geometric (compound) return while working, % per year. */
  accumReturn: ALLOCATIONS["80/20"].returnPct,
  /** Expected nominal geometric (compound) return in retirement, %. */
  retireReturn: ALLOCATIONS["60/40"].returnPct,
  inflationRate: 2.1,
  /**
   * Target plan confidence: the % of simulated markets the plan must survive.
   * The engine returns the earliest retirement age that meets it; a higher
   * target means retiring later.
   */
  targetSuccessRate: 90,
  /** How much the withdrawal can be reduced (%) before a simulation is considered failed. */
  spendingFlexibilityPct: 0,
} as const;

export type ReturnPreset = (typeof RETURN_PRESETS)[number];
export type ReturnPresetId = ReturnPreset["id"];

export function getReturnPresetById(id: ReturnPresetId | null): ReturnPreset | undefined {
  if (id === null) return undefined;
  return RETURN_PRESETS.find((preset) => preset.id === id);
}

/**
 * Look up volatility from a return preset. Used by Monte Carlo to get precise
 * volatility for known allocations rather than deriving it from returns.
 * Returns undefined if the preset is not found or doesn't have that volatility.
 */
export function getVolatilityFromPreset(
  presetId: ReturnPresetId | null,
  phase: "accum" | "retire",
): number | undefined {
  if (presetId === null) return undefined;
  const preset = getReturnPresetById(presetId);
  if (!preset) return undefined;
  return phase === "accum" ? preset.accumVolatility : preset.retireVolatility;
}

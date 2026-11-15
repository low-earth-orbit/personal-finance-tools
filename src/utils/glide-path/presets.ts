import { ALLOCATIONS } from "@/utils/allocations";

/**
 * Defaults and the capital-market curve for the glide-path recommender.
 *
 * Ported from `analysis/glide_path/recommender.py`. The engine optimizes the equity
 * weight at each step by Monte Carlo; these are the editable inputs and the default
 * return/vol curve (the shared stock/bond blends in `src/utils/allocations.ts`).
 */

/** Anchor: [equityWeight (0..1), nominal geometric mean %, vol %]. */
export type AllocAnchor = readonly [number, number, number];

/**
 * Default capital-market curve — the same stock/bond blends (stocks 6.4% / 12%, bonds 3.8% /
 * 5.5%, correlation 0.3) the other tools use (nominal geometric % per year; converted to
 * arithmetic, then deflated to real with `inflation`).
 */
export const DEFAULT_ALLOC_CURVE: AllocAnchor[] = [
  [1.0, ALLOCATIONS["100/0"].returnPct, ALLOCATIONS["100/0"].volatility],
  [0.9, ALLOCATIONS["90/10"].returnPct, ALLOCATIONS["90/10"].volatility],
  [0.8, ALLOCATIONS["80/20"].returnPct, ALLOCATIONS["80/20"].volatility],
  [0.7, ALLOCATIONS["70/30"].returnPct, ALLOCATIONS["70/30"].volatility],
  [0.6, ALLOCATIONS["60/40"].returnPct, ALLOCATIONS["60/40"].volatility],
  [0.5, ALLOCATIONS["50/50"].returnPct, ALLOCATIONS["50/50"].volatility],
  [0.4, ALLOCATIONS["40/60"].returnPct, ALLOCATIONS["40/60"].volatility],
  [0.3, ALLOCATIONS["30/70"].returnPct, ALLOCATIONS["30/70"].volatility],
  [0.2, ALLOCATIONS["20/80"].returnPct, ALLOCATIONS["20/80"].volatility],
  [0.1, ALLOCATIONS["10/90"].returnPct, ALLOCATIONS["10/90"].volatility],
  [0.0, ALLOCATIONS["0/100"].returnPct, ALLOCATIONS["0/100"].volatility],
];

/**
 * Default inputs. Rates are percentages; dollars are today's (real) dollars.
 * `numPaths` is exposed because this is a nerds tool. `bequestWeight`, `retirementMaxEquityPct`,
 * `interval` and `inflation` are engine settings the web app fixes (see `withFixedSettings`); the
 * Python CLI keeps them as research controls.
 */
export const DEFAULTS = {
  // ── About you ─────────────────────────────────────────────
  startAge: 35,
  retirementAge: 65,
  planningAge: 95,
  startSavings: 200000,
  annualContribution: 15000,

  // ── Retirement income ─────────────────────────────────────
  /** Target real annual spending in retirement. */
  targetIncome: 60000,
  /** Guaranteed real annual income (CPP/OAS/DB) once it starts. */
  guaranteedIncome: 20000,
  /**
   * Age guaranteed income starts. Before it (a "bridge" after an earlier retirement) the
   * portfolio funds the whole target; an age at or before retirement means from retirement.
   */
  guaranteedStartAge: 65,

  // ── Spending & preferences ────────────────────────────────
  /** 0 = constant real $; 1 = fully proportional to the balance; blends between. */
  flexibility: 0,
  /** When spending flexibly, the % of the live balance drawn each year. */
  withdrawalRate: 4,
  /** CRRA risk aversion */
  gamma: 4,
  /** Annual time-discount factor. */
  beta: 0.985,
  /** Bequest weight θ on u(money left + one year of target spending); 0 = none. */
  bequestWeight: 0,

  // ── Leverage ──────────────────────────────────────────────
  /** Max equity weight as a % (100 = no leverage; 150 = up to 1.5×). */
  maxEquityPct: 100,
  /** Max equity weight during retirement only (may be lower than the all-years cap). */
  retirementMaxEquityPct: 100,
  /** Real annual cost of borrowing (used only when maxEquityPct > 100). */
  borrowCost: 2,

  // ── Engine / Monte Carlo ──────────────────────────────────
  /** Monte Carlo paths (more = steadier, slower). */
  numPaths: 5000,
  /** Inflation used to deflate the curve to real. */
  inflation: 2.1,
  /** Years each recommended equity allocation is held before the next glide step. */
  interval: 5,
} as const;

/** Discrete grid step for the equity-weight search (fraction of equity). */
export const GRID_STEP = 0.05;

/** Risk-aversion presets surfaced as quick buttons. */
export const GAMMA_PRESETS = [2, 3, 4, 5] as const;

/**
 * Settings the web app does not expose: no bequest weight, a 5-year glide step, one equity
 * ceiling for all years, and the default inflation (the forward-block bundle is rescaled at that
 * rate, so another value would move only the iid mode). Applied to every loaded or edited input
 * so a value saved by an older version cannot linger unseen.
 */
export function withFixedSettings<T extends { maxEquityPct: unknown }>(input: T): T {
  return {
    ...input,
    bequestWeight: DEFAULTS.bequestWeight,
    interval: DEFAULTS.interval,
    inflation: DEFAULTS.inflation,
    retirementMaxEquityPct: input.maxEquityPct,
  };
}

/** Spending-flexibility presets (fraction). */
export const FLEX_PRESETS = [
  { value: 0, label: "Constant $" },
  { value: 0.5, label: "Half-flex" },
  { value: 1, label: "Fully flexible" },
] as const;

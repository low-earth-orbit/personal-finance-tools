import type { DEFAULTS, SWR_HORIZONS } from "./presets";

export type SwrInputKey = keyof typeof DEFAULTS;

/**
 * Safe-withdrawal-rate inputs. Typed as numbers, but form fields may transiently hold "" while
 * editing (mirrors the other tools); validation flags those before the engine runs.
 */
export type SwrInput = Record<SwrInputKey, number>;

export type SwrErrors = Partial<Record<SwrInputKey, string>>;

export type SwrHorizon = (typeof SWR_HORIZONS)[number];

/**
 * How the year-by-year returns are generated. "simulated": per-asset AR(1) from the user's
 * correlation and VR(10) inputs. "historical": stationary block bootstrap of JST history (16
 * countries, 1871-2020), each asset rescaled to the user's return and volatility.
 */
export type SwrReturnModel = "simulated" | "historical";

export interface SwrAllocation {
  /** "60/40" (stocks / bonds). */
  label: string;
  /** Stock weight, 0-1. */
  equity: number;
}

export interface SwrResult {
  /** The return model this table was computed with. */
  returnModel: SwrReturnModel;
  horizons: readonly number[];
  allocations: SwrAllocation[];
  /** rates[allocation][horizon]: safe withdrawal rate as a fraction of the starting portfolio. */
  rates: number[][];
  /** AR(1) coefficients implied by the variance ratios; null in historical mode. */
  phiStock: number | null;
  phiBond: number | null;
  /**
   * Correlation between the two assets' yearly shocks (after adjusting for the AR(1) terms);
   * null in historical mode.
   */
  innovationCorrelation: number | null;
  /** True when the shock correlation had to be capped at +/-0.99 (never in historical mode). */
  correlationClamped: boolean;
}

export interface SwrWorkerRequest {
  requestId: number;
  input: SwrInput;
  returnModel: SwrReturnModel;
}

export interface SwrWorkerResponse {
  requestId: number;
  result: SwrResult;
}

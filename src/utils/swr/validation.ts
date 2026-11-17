import { DEFAULTS } from "./presets";
import type { SwrErrors, SwrInput, SwrInputKey, SwrReturnModel } from "./types";

interface Constraint {
  min: number;
  max: number;
  step: number;
  label: string;
}

// Labels match the on-screen field labels so validation errors name the field the user sees.
export const FIELD_CONSTRAINTS: Record<SwrInputKey, Constraint> = {
  stockReturn: { min: 0, max: 15, step: 0.1, label: "Stock return" },
  stockVol: { min: 1, max: 40, step: 0.1, label: "Stock volatility" },
  bondReturn: { min: 0, max: 10, step: 0.1, label: "Bond return" },
  bondVol: { min: 0.5, max: 25, step: 0.1, label: "Bond volatility" },
  correlation: { min: -0.9, max: 0.9, step: 0.05, label: "Stock-bond correlation" },
  inflationRate: { min: 0, max: 10, step: 0.1, label: "Inflation" },
  successRate: { min: 80, max: 99, step: 1, label: "Success rate" },
  stockVr: { min: 0.5, max: 3, step: 0.05, label: "Stock VR(10)" },
  bondVr: { min: 0.5, max: 3, step: 0.05, label: "Bond VR(10)" },
};

const KEYS = Object.keys(DEFAULTS) as SwrInputKey[];

/** Inputs the historical model takes from history instead; hidden and not validated there. */
export const SIMULATED_ONLY_KEYS: readonly SwrInputKey[] = ["correlation", "stockVr", "bondVr"];

export function validateSwrInput(
  input: SwrInput,
  returnModel: SwrReturnModel = "simulated",
): SwrErrors {
  const errors: SwrErrors = {};
  const keys =
    returnModel === "historical" ? KEYS.filter((key) => !SIMULATED_ONLY_KEYS.includes(key)) : KEYS;

  for (const key of keys) {
    const value = input[key];
    const { min, max, label } = FIELD_CONSTRAINTS[key];

    if (typeof value !== "number" || Number.isNaN(value)) {
      errors[key] = `${label} is required.`;
      continue;
    }
    if (value < min || value > max) {
      errors[key] = `Must be between ${min} and ${max}`;
    }
  }

  return errors;
}

import { DEFAULTS } from "./presets";
import type { SwrInput, SwrInputKey, SwrReturnModel } from "./types";

const KEY = "swr_input";

export function loadInput(): SwrInput {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<Record<SwrInputKey, unknown>>;
    // Keep only numeric fields; anything else falls back to the default.
    const current = Object.fromEntries(
      (Object.keys(DEFAULTS) as SwrInputKey[])
        .filter((key) => typeof parsed[key] === "number")
        .map((key) => [key, parsed[key]]),
    ) as Partial<SwrInput>;
    return { ...DEFAULTS, ...current };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveInput(input: SwrInput): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(input));
  } catch {
    // localStorage may be unavailable (private mode, quota); ignore.
  }
}

const RETURN_MODEL_KEY = "swr_return_model";
export const DEFAULT_RETURN_MODEL: SwrReturnModel = "simulated";

/** Saved return model; anything unrecognised (including nothing saved) is the default. */
export function loadReturnModel(): SwrReturnModel {
  if (typeof window === "undefined") return DEFAULT_RETURN_MODEL;
  try {
    const raw = window.localStorage.getItem(RETURN_MODEL_KEY);
    if (raw === "simulated" || raw === "historical") return raw;
  } catch {
    // ignore
  }
  return DEFAULT_RETURN_MODEL;
}

export function saveReturnModel(model: SwrReturnModel): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RETURN_MODEL_KEY, model);
  } catch {
    // localStorage may be unavailable (private mode, quota); ignore.
  }
}

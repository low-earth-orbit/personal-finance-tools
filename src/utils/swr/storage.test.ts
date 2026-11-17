import { afterEach, describe, expect, it } from "vitest";
import { DEFAULTS } from "./presets";
import { loadInput, loadReturnModel, saveInput, saveReturnModel } from "./storage";

afterEach(() => localStorage.clear());

describe("swr storage", () => {
  it("falls back to the defaults when nothing is saved", () => {
    expect(loadInput()).toEqual(DEFAULTS);
  });

  it("round-trips inputs", () => {
    const saved = { ...DEFAULTS, stockReturn: 7.5, successRate: 95 };
    saveInput(saved);
    expect(loadInput()).toEqual(saved);
  });

  it("keeps only numeric fields and fills the rest from the defaults", () => {
    localStorage.setItem(
      "swr_input",
      JSON.stringify({ stockReturn: 8, bondReturn: "high", unknown: 3 }),
    );
    expect(loadInput()).toEqual({ ...DEFAULTS, stockReturn: 8 });
  });

  it("ignores corrupt data", () => {
    localStorage.setItem("swr_input", "{nope");
    expect(loadInput()).toEqual(DEFAULTS);
  });
});

describe("swr return model storage", () => {
  it("defaults to simulated, including for inputs saved before the switch existed", () => {
    saveInput({ ...DEFAULTS });
    expect(loadReturnModel()).toBe("simulated");
  });

  it("round-trips the model and ignores unknown values", () => {
    saveReturnModel("historical");
    expect(loadReturnModel()).toBe("historical");
    localStorage.setItem("swr_return_model", "bootstrap");
    expect(loadReturnModel()).toBe("simulated");
  });
});

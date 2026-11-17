import { describe, expect, it } from "vitest";
import { DEFAULTS } from "./presets";
import { validateSwrInput } from "./validation";

describe("validateSwrInput", () => {
  it("accepts the defaults", () => {
    expect(validateSwrInput({ ...DEFAULTS })).toEqual({});
  });

  it("flags out-of-range and empty fields", () => {
    const errors = validateSwrInput({
      ...DEFAULTS,
      stockVol: 0,
      correlation: 1.2,
      inflationRate: "" as unknown as number,
      successRate: 100,
    });
    expect(errors.stockVol).toBe("Must be between 1 and 40");
    expect(errors.correlation).toBe("Must be between -0.9 and 0.9");
    expect(errors.inflationRate).toBe("Inflation is required.");
    expect(errors.successRate).toBe("Must be between 80 and 99");
  });

  it("validates the VR fields", () => {
    const errors = validateSwrInput({ ...DEFAULTS, stockVr: 5, bondVr: 0.1 });
    expect(errors.stockVr).toBe("Must be between 0.5 and 3");
    expect(errors.bondVr).toBe("Must be between 0.5 and 3");
  });

  it("skips the correlation and VR fields in historical mode, where they are hidden", () => {
    const input = { ...DEFAULTS, correlation: 1.2, stockVr: 5, bondVr: "" as unknown as number };
    expect(Object.keys(validateSwrInput(input))).toEqual(["correlation", "stockVr", "bondVr"]);
    expect(validateSwrInput(input, "historical")).toEqual({});
    expect(validateSwrInput({ ...input, stockVol: 0 }, "historical")).toEqual({
      stockVol: "Must be between 1 and 40",
    });
  });
});

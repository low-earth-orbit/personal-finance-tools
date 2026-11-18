import { describe, expect, it } from "vitest";
import { renderWithMantine, screen } from "@/test-utils";
import TaxAssumptions from "./TaxAssumptions";

describe("TaxAssumptions", () => {
  it("shows the assumptions without a fold", () => {
    const { container } = renderWithMantine(<TaxAssumptions />);

    expect(screen.getByRole("heading", { name: "Detailed model assumptions" })).toBeVisible();
    expect(screen.getByText(/Uses 2026 federal, New Brunswick/)).toBeVisible();
    expect(container.querySelector("details")).toBeNull();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithMantine } from "@/test-utils";
import Main from "./Main";

// The result chart runs a Web Worker, which jsdom doesn't provide; the state under test lives in Main.
vi.mock("./Result", () => ({ default: () => null }));

describe("rent-vs-buy Main preset persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("keeps the picked preset as the active one after leaving and returning", async () => {
    const first = renderWithMantine(<Main />);
    fireEvent.click(screen.getByRole("button", { name: "Calgary House" }));
    expect(screen.getByRole("button", { name: "Calgary House" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    first.unmount();

    // Going back to the list and re-entering the tool remounts Main.
    renderWithMantine(<Main />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Calgary House" })).toHaveAttribute(
        "aria-pressed",
        "true",
      ),
    );
    expect(screen.queryByText(/Edited from/)).toBeNull();
  });
});

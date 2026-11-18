import { describe, it, expect } from "vitest";
import { renderWithMantine, screen } from "@/test-utils";
import Footer from "./Footer";

describe("Footer", () => {
  it("renders the disclaimer and a GitHub link", () => {
    renderWithMantine(<Footer />);

    expect(screen.getByText(/not financial advice/i)).toBeInTheDocument();

    const github = screen.getByRole("link", { name: "GitHub" });
    expect(github).toHaveAttribute(
      "href",
      "https://github.com/low-earth-orbit/personal-finance-tools",
    );

    const site = screen.getByRole("link", { name: "Leo Hong" });
    expect(site).toHaveAttribute("href", "https://leohong.dev");
  });

  it("uses the theme's shared link style, not a per-link override", () => {
    renderWithMantine(<Footer />);

    for (const name of ["GitHub", "Leo Hong"]) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("data-underline", "always");
      expect(link.getAttribute("style") ?? "").not.toMatch(/color/);
    }
  });
});

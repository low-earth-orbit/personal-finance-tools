# Safe withdrawal rate table — Methodology

Research note for the **Safe withdrawal rates** tool (`/swr`). It shows the safe withdrawal rate (SWR) for eleven stock/bond mixes (100/0 to 0/100) over seven horizons (20 to 50 years), from capital-market assumptions the user sets. Code: engine [`src/utils/swr/engine.ts`](../../src/utils/swr/engine.ts), defaults [`src/utils/swr/presets.ts`](../../src/utils/swr/presets.ts). For the definition of SWR and the evidence for the default return assumptions, see the [retirement SWR methodology](../retirement/swr-methodology.md).

## 1. Model

- **Assets.** Stocks and bonds are simulated separately. Nominal geometric returns and volatilities are converted to real arithmetic means and volatilities with `realArithmeticFromNominalGeometric` (`src/utils/returns.ts`), the same conversion as the other tools.
- **Portfolio.** Rebalanced every year: `r = w·rS + (1−w)·rB`.
- **Withdrawal.** The SWR `w` is the **first-year withdrawal as a fraction of the starting portfolio**; each later year the dollar amount rises with inflation, so it is constant in real terms. This is the Bengen / Trinity-study "4% rule" convention. The model works in real dollars, so the recursion is mid-year as in the retirement engine: `B' = B(1+r) − w(1+r/2)`. There is no spending adjustment for market performance (no guardrails).
- **Paths.** 10,000 paths of 50 years, drawn once with the seeded RNG (`src/utils/rng.ts`) and shared by every allocation (common random numbers). Rows therefore move smoothly, and identical inputs give an identical table.

## 2. Exact SWR without a search

Divide the balance recursion by the cumulative growth `G_t = Π(1+r)`:

`B_H = G_H · (1 − w·S_H)`, with `S_H = Σ_{t=0}^{H−1} (1 + r_t/2) / G_{t+1}`.

`S_H` only grows with `H`, so a path lasts `H` years exactly when `w < 1/S_H`. The SWR at success rate `p` is the `(1−p)` quantile of `1/S_H` across paths. One pass per allocation records every horizon. A path whose portfolio return reaches −100% has maximum rate 0 from then on. A test checks one cell against a brute-force bisection on `w` over the same paths.

## 3. Return dynamics: VR(10) → AR(1)

Each asset's deviation from its mean follows an AR(1) process, with its persistence set by the user's VR(10) input (VR = 1 is independent years):

`d_t = φ·d_{t−1} + √(1−φ²)·σ·ε_t`

The `√(1−φ²)` factor keeps the one-year volatility at `σ`. The first deviation is drawn from the stationary distribution (`σ·ε_0`).

- **VR to φ.** `VR(q) = 1 + 2Σ_{k=1}^{q−1}(1−k/q)φ^k` with `q = 10`. `phiFromVr` inverts it by bisection on [−0.95, 0.95]. VR = 1 gives φ = 0, exactly iid. VR below 1 is mean reversion (φ < 0); above 1 is persistence (φ > 0).
- **Defaults.** VR(10) of 0.9 for stocks and 1.5 for bonds, which gives φ ≈ −0.058 for stocks and φ ≈ 0.22 for bonds. For reference, the JST pooled history (16 countries, 1871–2020) estimates 0.91 and 2.66 (see the retirement methodology); the default bond ratio is deliberately milder (see §5 for the effect). The VR inputs accept 0.5–3.
- **Correlation.** The user's ρ is the correlation of same-year returns. With AR(1) terms the yearly shocks need correlation `ρ_ε = ρ(1−φSφB) / √((1−φS²)(1−φB²))`. The first year, drawn from the stationary distribution, uses ρ itself. `ρ_ε` is capped at ±0.99; the result carries a `correlationClamped` flag and the page shows a notice.

## 4. Defaults

The default inputs are stocks 6.4% / 12%, bonds 3.8% / 5.5%, ρ = 0.3, inflation 2.1%, 90% success, all nominal compound returns, VR(10) 0.9 / 1.5. That gives 60/40 about 3.9% over 30 years and 2.9% over 50. Setting both VRs to 1 (independent years) gives 3.9% for 60/40 over 30 years; bond persistence mainly lowers the bond-heavy rows (0/100 over 30 years: 3.4% independent, 3.2% at the defaults).

## 5. Check against the block bootstrap

The AR(1) model was compared with a pooled forward-block bootstrap of the JST history (16 countries, 10-year stationary blocks, 20,000 paths; the method of the retirement methodology, §G). Each asset's history was affine-rescaled to this tool's defaults (stocks 6.4% / 12%, bonds 3.8% / 5.5%, 2.1% inflation), so only the sequencing is historical. The pooled history has a stock-bond correlation of 0.29 (the ρ = 0.3 default) and VR(10) of 0.91 for stocks and 2.66 for bonds. The AR(1) figures use ρ = 0.3, 100,000 paths and 90% success. Rows are stock/bond mixes; each cell is 30 years / 50 years.

| Model                              | 100/0       | 60/40       | 0/100       |
| ---------------------------------- | ----------- | ----------- | ----------- |
| Block bootstrap (pooled)           | 3.96 / 2.98 | 3.79 / 2.73 | 3.10 / 1.92 |
| AR(1), historical VR (0.91 / 2.66) | 3.83 / 2.87 | 3.79 / 2.75 | 2.93 / 1.83 |
| AR(1), tool defaults (0.9 / 1.5)   | 3.84 / 2.88 | 3.91 / 2.85 | 3.24 / 2.10 |
| AR(1), independent years (1 / 1)   | 3.74 / 2.79 | 3.90 / 2.85 | 3.42 / 2.25 |

- **With the historical ratios, 60/40 matches the bootstrap** to within 0.02 points at 20, 30, 40 and 50 years (30 years: 3.79% against 3.79%). The two effects in the retirement note, equity mean reversion helping and bond persistence hurting, are captured well enough in a balanced mix.
- **The all-stock and all-bond rows come out lower than the bootstrap**, by 0.1–0.2 points (30 years: 100/0 by 0.13, 0/100 by 0.17). The 100/0 gap involves no stock-bond interaction, so joint stock and bond dynamics are not the explanation. What a normal AR(1) leaves out (fat tails, skew, memory beyond one year) is a likely cause, but it was not tested.
- **The defaults are milder than history on bonds.** A bond VR of 1.5 instead of 2.66 raises the bond-heavy rows above the bootstrap (0/100 at 30 years: 3.24% against 3.10%) and puts 60/40 about 0.1 points above it (3.91% against 3.79%). Moving the bond VR toward 2.66 closes that gap.
- **The equal-weight world series is harsher than the pooled one.** Its bond VR(10) is about 3.7, and 60/40 gives 3.51% over 30 years on the same rescaled inputs, so pooled sequencing is the more generous comparator.

The figures come from a one-off comparison script that is not committed. It reuses the loaders and `rescale_to_targets` in `analysis/shared/jst_history.py` and the block sampler in `analysis/retirement/jst_swr_bootstrap.py`; differences under about 0.05 points are within sampling noise.

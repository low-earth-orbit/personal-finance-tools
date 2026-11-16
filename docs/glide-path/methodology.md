# Lifetime Allocation Optimizer — Methodology

Research note for the Lifetime Allocation Optimizer (`/glide-path`). The question: **what equity weight should a household hold at each age, before and after retirement?**

It assumes you know personal-finance basics (asset allocation, safe withdrawal rates, real versus nominal returns), not the statistics behind the tool. Terms are defined in [Key terms](#key-terms).

**How the answer is found.** A Monte Carlo optimizer tries equity weights age by age and keeps those that maximize the expected utility of retirement consumption. No rule of thumb such as "100 minus your age" is assumed. Results are reported under two return models:

- **iid**: each year's return is an independent draw from forward-looking assumptions (the app's default);
- **forward-block**: the same forward-looking averages, but with the year-to-year patterns of real historical sequences (the app's "Historical sequences" toggle).

## Contents

- [Summary](#summary)
- [Applying this](#applying-this)
- [Key terms](#key-terms)
- [1. Model](#1-model)
- [2. Results under iid returns](#2-results-under-iid-returns-the-default)
- [3. Results under historical sequencing](#3-results-under-historical-sequencing-forward-block)
- [4. The bond menu](#4-the-bond-menu)
- [5. Comparison with ACO and ERN](#5-comparison-with-aco-and-ern)
- [6. Caveats](#6-caveats)
- [7. Code and reproduction](#7-code-and-reproduction)
- [References](#references)

---

## Summary

Default household: age 35, $100k saved, $15k/yr contributions for 30 years, a $60k real retirement target of which $20k is guaranteed income (CPP/OAS/DB), a 30-year retirement, risk aversion γ = 4 and time preference β = 0.985.

1. **The return model decides whether there is a bond tent**, that is, equity dipping around retirement and rising again afterwards. Under iid, constant-dollar spending gives a tent bottoming at 60–80% equity (§2b), and the best constant weight is **80%** for a 30-year retirement (100% for 40 and 50 years; §2e). Under forward-block the optimum is **flat ~100% equity** (§3a).
2. **Flexible spenders hold ~100% equity** throughout, in both models (§2b, §3a).
3. **The glide's shape is worth little; its level matters more.** Out of sample, the optimized glide beats the best constant weight by ≤ ~1% of certainty-equivalent (CE) income under iid, and by ≈ $0 under forward-block (§2e, §3a).
4. **The iid tent depends on how well funded the plan is.** The default plan's first-year withdrawal is ~3.5% of its median retirement balance, and the optimizer still guards the floor (tent bottom 60%). At a ~2.6% draw the tent is 40%, at ~3.8% a shallow dip to 70%, and at ~4.3% a dip to 90% (§2f).
5. **Flat 100% is a verdict on the bond menu, and funding decides whether a real bond earns a place.** Swapping long nominal bonds for an idealized real asset (the long bonds' mean and volatility, with no equity correlation or persistence) moves the optimum to 70% at the default and 45% overfunded. The realistic leg (§4c) keeps the default at 100% equity and moves the overfunded plan ($200k / $20k, 2.6% draw) to 55%, at a 1.00% real mean below the 2.64% 5-year TIPS yield of 12 Nov 2026. At 2.00%, still below that yield, the default moves to 60% and the overfunded plan to 30%. Nominal bonds stay at 100% at both funding levels (§4a, §4c). In 1990–2020, nominal bonds already give ~80% (§3c).
6. **A real bond sleeve is insurance against inflation regimes, not a free gain.** Over the full history an all-real sleeve on the idealized leg adds 2.6% of CE at the default, while the realistic leg (1.00% mean) adds nothing, since 100% equity stays best. Overfunded, an all-real sleeve on the realistic leg at 60% equity adds 1.9% with no regret across the regime mix (§4d). In 1990–2020 the sleeve on the idealized leg adds 0.7–1.7% at the default and the sleeve on the realistic leg costs 0.5–0.9%. Pair ~70% equity with an all-real idealized sleeve at the default and ~100% with the realistic one (1.00% mean); overfunded, use ~50% and ~60%. A US-CPI-linked fund hedges ~90% of Canadian 10-year inflation where inflation matters (§4d).
7. **Guessing the regime wrong costs little.** Any constant weight from 90% to 100% costs at most ~1.2% of CE in any regime tested (80% costs up to ~3%; §3d), so a weight between the two models' answers is a safe choice.
8. **γ barely matters with constant-dollar spending.** Consumption is then almost always the full target or the guaranteed floor, so every γ ranks allocations the same way (§2d).

The app recommends what the selected model's simulation produces: the optimized glide, or the best constant weight unless the glide is clearly better (§1.5). Run both return models (`--compare-modes` in the CLI, or the app's Simulation toggle), since they can disagree on the best constant weight by 20pp (80% under iid, 100% under forward-block).

---

## Applying this

- **Leverage earns little.** In a young-saver case (age 30, $100k saved, $20k/yr for 30 years, $70k target), allowing up to 150% equity raised CE by under 1% ($150–290/yr) in both models, and the optimizer used it only in the first decade (the first 5 years under iid, the first 10 under forward-block). That is inside the model's own uncertainty and ignores margin calls, rate changes and behaviour. Treat equity above ~110% as unrewarded.
- **An overfunded plan has no best allocation.** When every constant weight already delivers the target (both engines flag this), the allocation does not change income and the reported weight is the middle of a tie. Decide what the surplus is for: leave it (a bequest weight, Python `--bequest-weight` only) or use it (retire earlier or spend more).
- **Bequest weight (Python only; the web app fixes θ = 0).** θ = 0.25 / 0.5 on u(money left + one year of target spending) (§1.4). With γ = 4 a large estate adds little utility, so θ barely moves a plan that needs its money; in an overfunded plan it replaces the tie with a real choice (55–60% equity in retirement instead of a ~50% tie midpoint in our test).
- **Guaranteed-income start age.** A start age after retirement models a bridge: the portfolio funds the whole target until CPP/OAS/DB begins (§1.1). Retiring at 60 with $20k from 65 cost about 9% of CE ($38.8k → $35.4k) against the same income from 60, and raised full-path shortfall from 34% to 41% (25 years of saving, a 35-year retirement, iid).
- **The app's bonds are nominal.** Its bond asset is the forward curve's bond (iid) or JST long government bonds (forward-block). The real-bond results in §4 are research, not an app option. If your bond sleeve is mostly real-return bonds, §4d applies: the idealized leg points to ~70% equity at the default and ~50% overfunded; the realistic leg to ~100% and ~60% at a 1.00% mean, or ~60% and ~30% at 2.00% (§4c).

---

## Key terms

**Returns and simulation**

| Term | Meaning here |
| --- | --- |
| **Real return** | Return after inflation. All amounts in this note are real (today's) dollars. |
| **Geometric vs arithmetic return** | Geometric is the rate a balance actually compounds at; arithmetic is the simple average of yearly returns, higher by roughly σ²/2 for a volatile asset. Planning assumptions are quoted geometric; a Monte Carlo draws from the arithmetic mean (§1.3). |
| **Monte Carlo** | Simulating thousands of possible market paths and averaging the outcomes. |
| **iid** | Independent and identically distributed: each year's return is a fresh draw, unrelated to earlier years. |
| **Sequencing** | The order in which good and bad years arrive, such as crashes followed by recoveries, or inflation decades. iid removes it. _Sequence-of-returns risk_ is a retiree's exposure to it: an early crash does more damage than a later one. |
| **Block bootstrap** | Simulating from history while keeping sequencing: paths are stitched from runs (blocks) of consecutive historical years. The _stationary_ version uses random block lengths with a set mean (here 10 years). |
| **Forward-block** | This note's historical-sequencing model: JST history rescaled to the forward-looking assumptions, then block-bootstrapped (§1.3). |
| **Variance ratio, VR(q)** | Variance of q-year cumulative returns ÷ (q × variance of one-year returns). It is 1 for iid returns. |
| **Mean reversion (VR < 1)** | Bad years tend to be followed by better ones, so multi-year outcomes spread _less_ than iid predicts. |
| **Persistence (VR > 1)** | Bad years tend to be followed by more bad years, so multi-year outcomes spread _more_ than iid predicts. |
| **AR(1), φ** | Each year's deviation from the mean is φ times last year's plus fresh noise. φ > 0 means persistence; the long-run VR is (1+φ)/(1−φ). |

**Spending, welfare and the optimizer**

| Term | Meaning here |
| --- | --- |
| **Glide path** | The equity weight as a function of age. A **constant** weight holds one mix for life; the **best constant weight** is the single mix with the highest CE. |
| **Bond tent** | A glide path that lowers equity into retirement and raises it afterwards, to protect early-retirement years against sequence risk. |
| **Gap** | Spending target minus guaranteed income: what the portfolio must fund ($60k − $20k = $40k by default). |
| **Guaranteed floor** | Guaranteed income (CPP/OAS/DB). Consumption falls to it when the portfolio cannot pay. |
| **flex** | Spending flexibility, from 0 (constant real dollars) to 1 (a fixed percentage of the current balance) (§1.2). |
| **SWR, success rate** | Safe withdrawal rate: the highest initial withdrawal, as a share of the starting balance, that a constant-dollar plan sustains in a given share of paths (the success rate). |
| **CRRA utility, γ** | A dollar matters more when consumption is low, and a given _percentage_ gamble is disliked equally at any income level. γ sets how strongly: 4 is the base case, ~1–10 the plausible range. |
| **β** | Time preference: each later year's utility is weighted by β per year (0.985). |
| **Certainty-equivalent (CE) income** | The guaranteed constant annual consumption the household would value the same as the risky plan. It sits below average spending because shortfalls hurt more than surpluses help. It is the headline welfare measure. |
| **Income shortfall** | A path with at least one year where the portfolio could not fund the target ("depletion" in the code). **Full-path** shortfall simulates from today; **drawdown-only** starts from the median retirement balance, as `/retirement` does. |
| **Regret** | The CE a choice loses against the best choice for a given scenario. _Maximum regret_ is the worst such loss across scenarios. |

**Bonds, data and sources**

| Term | Meaning here |
| --- | --- |
| **Duration** | A bond's price sensitivity to yield changes, in years. A 10-year bond (~7–10) swings with rates; a short bond (~2–3) barely does. |
| **Carry** | The income a bond earns from its starting yield, before any price change. |
| **Term premium** | The extra expected return long bonds earn over short ones for bearing rate risk. |
| **Real asset, sleeve** | A real asset's return is fixed in after-inflation terms (an inflation-linked bond). The _bond sleeve_ is the non-equity part of the portfolio. A _real sleeve_ holds real-return bonds in that part; §4d blends them with nominal bonds. |
| **Leg** | The return assumptions for the real-bond part of a sleeve: _idealized_ (§4a, cell b) or _realistic_ (§4c, 1.00% real mean). A sleeve is built on a leg. |
| **TIPS / RRB** | Inflation-linked government bonds: US Treasury Inflation-Protected Securities and Canadian Real Return Bonds. VTIP is a US short-TIPS ETF. |
| **Hold-to-maturity ladder** | Individual bonds bought to mature in each year they are needed. Each rung's value at maturity (real for RRBs/TIPS) is fixed at purchase. |
| **JST** | The Jordà–Schularick–Taylor Macrohistory database (R6): annual returns for 16 countries with both stock and bond series, 1871–2020. |
| **ACO** | Anarkulova, Cederburg & O'Doherty, whose block-bootstrap study recommends ~100% equity for life (§5). |
| **ERN, CAPE** | Early Retirement Now, a blog series on safe withdrawal rates (§5). CAPE is the cyclically adjusted price/earnings ratio, a valuation signal. |

---

## 1. Model

**In brief.** A household saves, retires and spends. Each year its portfolio is split between one equity asset and one bond asset at that age's equity weight. The optimizer picks the weights that maximize the expected utility of retirement consumption. All amounts are real dollars.

### 1.1 Household and phases

- **Accumulation:** the starting balance plus fixed real contributions, made mid-year. Consumption while working does not depend on the allocation, so the accumulation allocation matters only through the wealth it hands to retirement.
- **Retirement:** a fixed horizon, with no mortality weighting. The portfolio funds the gap between the target and guaranteed income, withdrawn mid-year. Wealth left at the end is worth nothing unless a bequest weight is set (§1.4).
- **Guaranteed-income start age:** guaranteed income starts at retirement by default. A later start models a _pre-pension bridge_: the guaranteed income is 0 until it starts and the portfolio funds the whole (gross) target. During the bridge, consumption is scored at no less than the guaranteed amount, so a portfolio that runs dry before the pension starts costs utility like a depleted year after it, not −∞; the shortfall is still counted. Because of that floor, guaranteed income at or above the target with flexibility 0 and no bequest weight leaves every allocation tied, bridge or not, and both the app and the CLI reject it. The app's ≥ $10k guaranteed-income requirement applies from the start age.

### 1.2 Spending rule

Each retirement year the withdrawal targets a blend of a constant-dollar rule and a balance-proportional rule:

```
targetₜ      = (1 − flex)·gap + flex·(withdrawal_rate · start-of-year balanceₜ)
withdrawalₜ  = min(targetₜ, what the portfolio can afford)
consumptionₜ = guaranteed incomeₜ + withdrawalₜ    (≥ the guaranteed amount during a bridge)
```

`gap` is the target minus that year's guaranteed income, so it is the full target during a bridge.

- **flex = 0 (constant dollar):** withdraw the full gap every year until the money runs out, then live on guaranteed income. This is the setting of `/retirement`.
- **flex = 1 (fully flexible):** spend `withdrawal_rate` (default 4%) of the current balance. Income moves with the market, the portfolio never runs out, and the target is not used.
- **flex = 0.5 (semi-flexible):** half of each.

At flex = 1 shortfall is ~0 by construction; risk shows up as income variability instead.

### 1.3 Returns

**Capital-market curve.** The default curve ([`presets.ts`](../../src/utils/glide-path/presets.ts) `DEFAULT_ALLOC_CURVE`) is the stock/bond blend the other tools use ([`allocations.ts`](../../src/utils/allocations.ts)): stocks 6.4% return / 12% volatility, bonds 3.8% / 5.5%, stock-bond correlation 0.3, 2.1% inflation. It lists nominal **geometric** returns and volatilities by equity weight, every 10 points. Monte Carlo draws need **arithmetic** means, so each point is converted with the exact lognormal relation

```
(1+A)² = [ (1+G)² + √((1+G)⁴ + 4(1+G)²σ²) ] / 2
```

then deflated to real (`(1+A)/(1+π) − 1`, volatility `σ/(1+π)`) and interpolated to any weight. Simulated compound growth then matches each mix's stated rate within ~1bp.

|                | Real geometric | Real arithmetic | Real volatility |
| -------------- | -------------- | --------------- | --------------- |
| 100% equity    | 4.21%          | 4.86%           | 11.8%           |
| 0% equity      | 1.67%          | 1.81%           | 5.4%            |
| Equity premium | 2.55pp         | 3.06pp          |                 |

The curve's volatilities imply a stock/bond correlation of ≈0.30, the CMA's input. Because inflation is a constant 2.1%, iid bonds carry no inflation risk. Median-path balances (used for drawdown-only shortfall and the funding ratio) compound at the geometric rate.

**Return modes.** All four share the cash flows, objective and optimizer; only the source of yearly returns differs:

| Mode | Sequencing | Return levels (mean, volatility) | Stock/bond correlation |
| --- | --- | --- | --- |
| `iid-mc` (default) | none (iid normal) | forward curve | implicit in curve vols (≈0.30) |
| `historical-iid` | none (years resampled) | raw history | historical, paired by year |
| `historical-block` | stationary block bootstrap | raw history | historical, paired by year |
| `forward-block` (scenario) | stationary block bootstrap | history rescaled to the forward 0%- and 100%-equity endpoints | historical (≈0.29 pooled) |

- **History:** JST R6 real stock and long-government-bond returns (16 countries, 1871–2020), deflated by each country's CPI.
- **Datasets:** `pooled` (default) strings together each country's own sequence, so a block is consecutive years of one country: the sequence risk a single-country investor actually lived. `world` averages countries within each year. Pooled runs accept country and year exclusions. Blocks never cross countries or data gaps; at the end of a country's run they wrap to its first year.
- **Stationary block bootstrap:** each simulated year continues the current historical run with probability `1 − 1/L` or jumps to a random year with probability `1/L`, so blocks average `L` years (default 10, an annual analogue of ACO's 120 months). Figure 2 in §3 shows one path.
- **Rescaling** (forward-block) gives each asset's series the forward mean and volatility. It keeps the year-to-year pattern and the stock/bond correlation, so any difference from iid comes from sequencing and return shape, not from history's higher returns. Only the endpoints (100% stocks, 100% bonds) are matched to the curve; mixes in between follow the historical correlation (≈0.29), close to the curve's 0.30.
- **Leverage:** above 100% equity the return is `w·stock − (w−1)·real borrowing cost`; a wipeout is ruin.

The historical modes are annual sequencing checks, not an ACO replication (ACO bootstraps a monthly four-asset panel, with mortality-weighted horizons and terminal wealth in the objective).

### 1.4 Objective and optimizer

- **Objective:** maximize expected Σ βᵗ·u(consumptionₜ) + θ·u(W_T + k) over retirement, with CRRA utility `u(c) = c^(1−γ)/(1−γ)` (log at γ = 1). The optional bequest term values final wealth W_T with the same γ, offset by k (default: one year of target spending, so a zero estate is finite) and undiscounted. θ = 0 by default (no bequest). CE income converts the consumption part back into dollars; with θ > 0 a **welfare CE** also includes the bequest term, measured against an empty estate. Both engines report the median money left at the end.
- **Decision variable:** the equity weight for each step, a run of years held at one weight: 1 year in §2 and §3a; 5 years in the `research_history` sections (§2f, §3b–§4) and in the app, where the step is fixed. Weights sit on a 5pp grid (10pp in §2).
- **Coordinate ascent:** starting from the best constant weight, the optimizer tries every weight for one step with the others fixed, keeps the best, and cycles through the steps until nothing moves (at most 10–12 passes in Python, 6 in the app). No shape is imposed. The result is a coordinate-wise optimum, not a guaranteed global one.
- **Common random numbers:** all candidates are scored on the same simulated paths, so differences between them are not sampling noise.

Grids and step lengths differ between sections, so tent depths from §2 (10pp, 1-year) and from §2f or §3b (5pp, 5-year) can differ by a grid step or two.

### 1.5 Evaluation and the product recommendation

Three independent sets of simulated paths keep the comparison honest: the glide is fitted on an **optimization sample**, the best constant weight is picked on a **selection sample**, and both are scored on an **evaluation sample**. Every CE and shortfall figure in this note is out of sample in this sense.

**Simplicity rule (web app).** The app recommends the constant weight unless the glide beats it by more than 3% on CE income or by more than 1 point on full-path shortfall (`SIMPLICITY_*` in [`recommendation.ts`](../../src/utils/glide-path/recommendation.ts)). The gate compares spending CE even when a bequest weight is set (the app fixes θ = 0, so this matters only for direct engine calls): the bequest already shapes both allocations through the objective, and welfare CE is ill-conditioned for well-funded plans (it inverts u near the CRRA bound, so a 0.1% spending-CE gap can show as a 4–5% welfare-CE gap).

CE gaps under ~3% are inside the model's own uncertainty: glide edge ≤ ~1%, Monte Carlo noise ~0.3%, era regret ≤ ~1.2% for weights of 90–100%. Across 72 input combinations, every threshold of 2% or more gave the same seed-stable picks, and the constant never added more than 0.3pp of full-path shortfall (calibration notes in the source). The Python CLI has no simplicity rule; it flags the constant weight when its CE beats the glide's by more than 5%. Both always report the raw optimized glide.

**Overfunded plans and ties.** When θ = 0 and every constant weight on the selection sample delivers the target (CE within 0.5% and shortfall under 0.5%), both engines flag the plan as overfunded: the allocation does not change income. Ties among equally good weights (exact or within 1e-12) go to the middle of the tied range, for the optimizer's starting weight and for the best constant weight; a first-wins rule would report 0% equity, a corner the objective did not choose.

**What the app reports.** For each allocation: CE income, drawdown-only and full-path shortfall, the median money left at the end, and the year-1 portfolio draw as a share of that allocation's median retirement balance. When the optimized glide is a single weight (common with flexible spending and tightly funded plans) it is the constant allocation, and the app shows it once. The app states no preference and shows both allocations side by side when the preferred one has a drawdown-only shortfall of 15% or more, or a full-path shortfall of 30% or more; it notes slack when drawdown-only shortfall is under 5% (flexibility below 0.5 only, since shortfall is ~0 by construction above that). A "Test another simulation sample" button reruns the same plan on fresh paths to show how much of the result is Monte Carlo noise.

### 1.6 Scope limits

- **Guaranteed income is required.** Without it, a depleted year drives consumption to ~$0, where CRRA utility plunges toward −∞ and a handful of ruined paths decide the comparison. Raising the floor would invent income; scoring only surviving paths would make every γ agree. The app therefore requires ≥ $10,000 of guaranteed income; Python accepts zero, and its glide-versus-constant comparison is then inconclusive. A bridge is handled by the consumption floor in §1.1.
- **Undetermined allocation.** With flex = 0, guaranteed income ≥ the target from retirement and no bequest weight, the portfolio funds nothing and every allocation ties; both engines reject this input.
- **Final retirement step.** With no bequest weight, the last step's allocation barely matters (the last year with 1-year steps, the last five years in the app). It is reported (the `end` column) but left out of the retirement slope and the tent whenever at least two earlier retirement steps exist; read it loosely.

---

## 2. Results under iid returns (the default)

**In brief.** With independent yearly returns, rigid spenders get a bond tent whose depth depends mainly on how well funded the plan is. Flexible spenders hold 100% equity. The tent's shape is worth only about 1% of CE income over the best constant weight.

`python3 -m analysis.glide_path.research` runs a per-age glide (1-year steps) on a 10pp grid with 8,000 optimization paths, scored on 60,000 independent paths.

**Reading the glide tables.** Columns are equity %:

- `start`, `acc. avg`, `pre-ret`, `@ret`: equity at the first age, the accumulation average, the year before retirement, and the retirement year;
- `tent (age)`: the lowest equity within 15 years either side of retirement, and the age where it occurs (the same rule the app and CLI use; ties go to the retirement side);
- `end`: final-year equity (read loosely, §1.6);
- `BEFORE` / `AFTER`: the slope of the accumulation and retirement segments;
- `CE income`, and `Shortfall` (full-path).

### 2a. Safe-withdrawal-rate check

First, the familiar SWR framing: retirement only, constant dollar, the highest initial withdrawal rate with 90% success. Columns give that SWR for the best constant weight (in brackets), for 100% equity, and for a retirement glide rising from 60% to 100%.

| Horizon | Best constant (w\*) | 100% equity | Rising 60→100 |
| ------- | ------------------- | ----------- | ------------- |
| 30y     | **3.89%** (60%)     | 3.74%       | 3.90%         |
| 40y     | **3.23%** (70%)     | 3.14%       | 3.25%         |
| 50y     | **2.85%** (70%)     | 2.79%       | 2.88%         |

The SWR-maximizing weight is 60–70%, and the curve is flat near the top (100% equity costs 0.06–0.15pp). A rising glide only ties the best constant weight, within 0.03pp: **no SWR premium under iid**. ERN's rising-glide effect needs valuation signals or mean reversion, which iid excludes.

### 2b. Retirement-horizon sweep (30-year accumulation)

The default household (retiring at 65) with retirements of 30, 40 and 50 years, under each spending rule.

| Spending | Ret. horizon | start | acc. avg | pre-ret | @ret | tent (age) | end | BEFORE | AFTER | CE income | Shortfall |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| constant $ | 30y | 100 | 85 | 60 | 60 | 60 (@65) | 80 | Falling | Rising | $48,859 | 15.6% |
| constant $ | 40y | 100 | 95 | 80 | 70 | 70 (@65) | 100 | Falling | Rising | $43,385 | 22.6% |
| constant $ | 50y | 100 | 99 | 100 | 80 | 80 (@65) | 100 | Flat | Falling | $40,181 | 27.0% |
| semi-flex 50% | 30y | 100 | 97 | 90 | 80 | 80 (@65) | 100 | Flat | Rising | $59,949 | 3.6% |
| semi-flex 50% | 40y | 100 | 96 | 80 | 80 | 70 (@69) | 100 | Falling | Rising | $55,229 | 8.8% |
| semi-flex 50% | 50y | 100 | 97 | 80 | 80 | 80 (@65) | 100 | Falling | Rising | $50,872 | 14.4% |
| flexible 100% | 30y | 100 | 100 | 100 | 100 | 100 (@65) | 100 | Flat | Flat | $58,569 | 0.0% |
| flexible 100% | 40y | 100 | 100 | 100 | 100 | 100 (@65) | 100 | Flat | Flat | $57,486 | 0.0% |
| flexible 100% | 50y | 100 | 100 | 100 | 100 | 100 (@65) | 100 | Flat | Flat | $56,564 | 0.0% |

- **Constant dollar → a tent.** Equity averages 85–99% through accumulation, dips to a low at retirement (60% at 30 years, 70% at 40, 80% at 50), then rises. Rigid income costs shortfall risk (16–27%, rising with the horizon). Longer retirements need more growth, so their tent is shallower.
- **Semi-flexible and flexible → ~100% throughout.** Accumulation averages 96–100%, and the tent is at most a dip to 70–80% (semi-flexible at every horizon; fully flexible holds 100% throughout). Their cost is income variability; shortfall is 0% for fully flexible spending and 4–14% for semi-flexible (rising with the horizon).
- The CE gap between rule rows is **not** the value of flexibility; see §2f.

### 2c. Accumulation-horizon sweep (30-year retirement)

Start age stays 35; the retirement age moves to 55, 65 or 75, so the household saves for 20, 30 or 40 years. Constant dollar shown; semi-flexible and flexible average 97–100% through accumulation at every horizon, with dips to 80–90% around retirement or later (fully flexible only at 40 years).

| Spending | Accum. years | start | acc. avg | pre-ret | @ret | tent (age) | end | BEFORE | AFTER | CE income | Shortfall |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| constant $ | 20y | 100 | 100 | 100 | 100 | 100 (@55) | 100 | Flat | Flat | $34,535 | 49.6% |
| constant $ | 30y | 100 | 85 | 60 | 60 | 60 (@65) | 80 | Falling | Rising | $48,859 | 15.6% |
| constant $ | 40y | 100 | 70 | 40 | 50 | 40 (@76) | 100 | Falling | Rising | $57,860 | 3.2% |

A longer accumulation acts as a funding lever. A 40-year saver is well funded for the $40k gap (3.2% shortfall): the optimum averages ~70% equity, is 40% in the year before retirement and bottoms at 40% just after. A 20-year saver is badly underfunded (49.6% shortfall) and holds 100% throughout.

### 2d. Risk aversion (30y + 30y)

| Spending      | γ   | start | acc. avg | pre-ret | @ret | tent (age) | end | BEFORE  | AFTER  |
| ------------- | --- | ----- | -------- | ------- | ---- | ---------- | --- | ------- | ------ |
| constant $    | 2   | 100   | 85       | 60      | 60   | 60 (@65)   | 80  | Falling | Rising |
| constant $    | 4   | 100   | 85       | 60      | 60   | 60 (@65)   | 80  | Falling | Rising |
| constant $    | 8   | 100   | 85       | 60      | 60   | 60 (@65)   | 100 | Falling | Rising |
| flexible 100% | 8   | 100   | 90       | 70      | 70   | 60 (@68)   | 80  | Falling | Rising |

Flexible spending holds 100% throughout at γ = 2 and 4.

**Why γ doesn't move the constant-dollar tent.** With consumption capped at the target, ~96% of simulated retirement years sit exactly at the target and ~4% at the floor. Expected utility is then a constant minus (the utility gap between target and floor) × (expected discounted years at the floor). Any utility function therefore ranks allocations by those floor-years; γ only rescales the CE level.

- The recommender's best constant weight is 80% for γ = 1, 2, 4 and 8. Scored under any one γ, the four γ-optimized glides differ by ≤ ~$10/yr (under 0.1% of CE) (`research_history --sections gamma`, 5-year steps).
- The tent bottoms (60%, 60%, 60%) are identical across γ.
- γ matters once spending flexes: fully flexible spending at γ = 8 averages 90% through accumulation and dips to 60% around retirement, against 100% at γ ≤ 4.

### 2e. Is the glide shape worth anything? (out of sample)

CE income ($/yr) on the evaluation sample, constant dollar. `opt ret / 100% acc` keeps the optimized retirement glide but holds 100% equity through accumulation; `best constant` is picked on the separate selection sample (§1.5).

| Ret. horizon | optimum | opt ret / 100% acc | 100% equity | best constant (w\*) | glide vs best constant |
| --- | --- | --- | --- | --- | --- |
| 30y | $48,900 | $48,343 | $48,211 | $48,441 (80%) | **+$459** |
| 40y | $43,319 | $43,261 | $43,228 | $43,228 (100%) | **+$91** |
| 50y | $40,103 | $40,110 | $40,111 | $40,111 (100%) | **−$8** |

For semi-flexible and flexible spending the best constant weight is 100% at every horizon, and the glide's edge is −$21 to +$48 (noise).

- **Shape:** the glide adds ≤ ~$460/yr (~0.9%) for constant dollar at 30 years, nothing measurable at longer horizons, and ≤ ~$50 (~0.1%) once spending flexes. This matches Estrada's "glidepath illusion": in his historical tests, lifecycle glide paths do no better than a well-chosen fixed mix.
- **Level:** the optimum beats 100% equity by up to $690/yr (1.4%) at 30 years, $90 at 40 and nothing at 50. Holding 100% through accumulation costs ~$560/yr at 30 years and less at longer horizons ($60 at 40, nothing at 50).

### 2f. Funding level and the value of flexibility

`research_history --sections funding` (5-year steps).

**Funding level sets the iid tent.** Constant dollar; "gap ÷ balance" is the first-year withdrawal as a share of the median retirement balance.

| savings / contribution | gap ÷ balance | tent | best constant | CE      | full-path shortfall |
| ---------------------- | ------------- | ---- | ------------- | ------- | ------------------- |
| $300k / $30k           | 1.9%          | 30%  | 30%           | $59,961 | 0.1%                |
| $200k / $20k           | 2.6%          | 40%  | 50%           | $58,244 | 3.0%                |
| $200k / $15k           | 3.0%          | 50%  | 65%           | $54,520 | 7.7%                |
| $150k / $15k           | 3.2%          | 55%  | 70%           | $52,029 | 11.0%               |
| $100k / $15k (default) | 3.5%          | 60%  | 80%           | $48,804 | 15.6%               |
| $120k / $12k           | 3.8%          | 70%  | 100%          | $45,329 | 20.4%               |
| $100k / $10k           | 4.3%          | 90%  | 100%          | $40,219 | 29.9%               |

A spender capped at the target gains nothing from extra wealth (with no bequest weight) but loses heavily from shortfalls. The more overfunded the plan, the more the optimizer protects the floor.

**Compare spending rules at the same spending level.** At 4%, the flexible rule's first-year draw is ~$49k (4% of its ~$1.23M median balance), about 1.2× the constant rule's $40k. About a third of §2b's CE gap is therefore **spending more**; the rest is spending flexibly. The matched-draw rows set the rate to 3.24%, which gives the same $40k first-year draw.

| Rule                      | Withdrawal rate | Year-1 draw | CE      |
| ------------------------- | --------------- | ----------- | ------- |
| constant dollar (default) | —               | $40,000     | $48,804 |
| flexible at 4%            | 4.00%           | $49,389     | $58,468 |
| flexible, matched draw    | 3.24%           | $40,000     | $55,135 |
| semi-flex, matched draw   | 3.24%           | $40,000     | $58,196 |

At a matched draw, flexibility is worth **+$6.3k to +$9.4k/yr**. If each rule also picks its own best spending level, the gap widens: constant dollar peaks at $49.7k CE (at a $55k target, below the $60k default), flexible at $61.6k (a 6% rate). Flexibility lets the household spend wealth that a rigid plan must keep as a buffer.

---

## 3. Results under historical sequencing (forward-block)

**In brief.** History has patterns iid ignores: stocks partly recover after crashes, while long nominal bonds suffer bad decades. Keep both patterns, at the same forward-looking averages, and the bond tent largely disappears: the optimum becomes ~100% equity. CE rises 2% at 30 years and 4–5% at 40–50.

### How sequencing differs from iid

Forward-block replays JST single-country sequences, rescaled to iid's forward return levels. It keeps two patterns that iid removes, both measured by the **variance ratio** (how widely q-year returns spread compared with independent years):

- **Equity mean reversion** (VR(10y) ≈ 0.91). Bad stretches are partly followed by recovery, so the 10-year spread is about 0.95× the iid spread. A modest effect.
- **Long-bond persistence** (VR(10y) ≈ 2.7). Bad years cluster into bad decades, so the 10-year spread is about 1.6× the iid spread. Over the full sample two-thirds of this comes from inflation; after 1950, about half comes from the interest-rate cycle (§4b).

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="img/variance-ratio-dark.svg">
  <img alt="Two panels of cumulative real return against years held, in units of one-year standard deviation. Left, equities: the ±1 s.d. band (VR(10y) ≈ 0.91) runs just inside the dashed iid ±√years band. Right, long bonds: the band (VR(10y) ≈ 2.66) fans out well beyond the iid band, to about 1.6 times its width at 10 years. Thin grey lines are 40 actual 10-year historical windows." src="img/variance-ratio-light.svg">
</picture>

_Figure 1. The coloured band is ±1 standard deviation of the cumulative real return after each number of years held, in units of the one-year standard deviation. The dashed band is the iid value, ±√years. VR < 1 pulls the band inside (mean reversion); VR > 1 pushes it outside (persistence). Thin lines are 40 random actual 10-year windows from the pooled history._

Why this matters: the bond leg is the part of a retirement plan meant to be safe. If its bad years cluster, as in an inflation decade, it fails exactly when needed, while equity's partial recoveries make high equity less dangerous than iid suggests.

Each block is a run of consecutive real years, so the patterns survive in full over a few years and partly over a decade (a 10-year window lies inside one 10-year-average block only ~40% of the time):

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="img/block-bootstrap-dark.svg">
  <img alt="One simulated 40-year sequence made of four historical blocks: Italy 2007–13, Sweden 1940–48, USA 1966–73 and Finland 1984–99, with the path of $1 of real equity growth underneath and dotted lines at block boundaries." src="img/block-bootstrap-light.svg">
</picture>

_Figure 2. One simulated 40-year path from the stationary block bootstrap. Within a block, years follow in historical order, for stocks and bonds together; at each boundary the path jumps to a random country and year. The engine applies this to the rescaled series._

### 3a. The tent largely disappears

The product engine (`recommend_glide_path`, forward-block), 1-year steps, 5pp grid, 15,000 paths, γ = 4, 30-year accumulation. Columns as in §2:

| Spending | Ret. horizon | start | acc. avg | pre-ret | @ret | tent (age) | end | BEFORE | AFTER | CE income | Shortfall |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| constant $ | 30y | 100 | 100 | 100 | 100 | 90 (@67) | 100 | Flat | Flat | $49,929 | 11.7% |
| constant $ | 40y | 100 | 100 | 100 | 100 | 100 (@65) | 100 | Flat | Flat | $45,236 | 17.8% |
| constant $ | 50y | 100 | 100 | 100 | 100 | 100 (@65) | 100 | Flat | Falling | $42,091 | 22.6% |
| semi-flex 50% | 30y | 100 | 100 | 100 | 100 | 100 (@65) | 20 | Flat | Flat | $61,043 | 2.9% |
| flexible 100% | 30y | 100 | 100 | 100 | 100 | 100 (@65) | 100 | Flat | Flat | $60,135 | 0.0% |

Out of sample the best constant weight is 100% in every row, and the glide's edge over it is −$27 to $0/yr (noise). Compared with iid, constant-dollar accumulation stays at ~100% instead of averaging 85–99%, and the dip is 90–100% instead of 60–80%. CE is 2.2%, 4.3% and 4.8% higher at 30, 40 and 50 years ($49.9k vs $48.9k, $45.2k vs $43.4k, $42.1k vs $40.2k). This reproduces ACO's flat 100% on our own capital-market assumptions.

### 3b. What drives the flip

`research_history --sections matrix blocks channels` (constant dollar, 30y + 30y, 5-year steps; best constant weight per cell).

**Not pooling.** Best constant weight by dataset (CE where reported):

| Return model                                            | pooled        | world         |
| ------------------------------------------------------- | ------------- | ------------- |
| forward-block (forward levels, historical sequencing)   | 100% ($50.0k) | 100% ($49.4k) |
| raw historical-block (historical levels and sequencing) | 95% ($40.2k)  | 100%          |

iid-mc gives 80%. Forward-block reaches 100% on either dataset, so pooling is not the driver. Pooling matters only for raw history, where single-country disasters hit at full size; the forward rescale shrinks them to forward volatility.

**Sequencing is not what flips it.** By mean block length: 1y → 95%, 3y–40y → 100%. A 1-year mean block is nearly an iid resample of rescaled history (cell c below: 100%).

**Return shape does most of it at this funding level.** Forward-block differs from iid in three ingredients at once: the shape of yearly returns (normal vs history's skew and fat tails), equity sequencing (VR(10y) 0.91 vs 1) and bond sequencing (2.66 vs 1). The stock/bond correlation is now about the same in both (0.30 vs 0.29). The `channels` section switches the ingredients on one at a time, with each asset's forward mean and volatility held fixed.

| Cell | Return draws | Stock/bond corr. | Return shape | Equity VR(10y) | Bond VR(10y) | Best constant |
| --- | --- | --- | --- | --- | --- | --- |
| a | iid-mc baseline (the app's default) | 0.30 (curve) | normal | 1 | 1 | 80% |
| b1 | synthetic iid normals, two-asset | 0.30 | normal | 1 | 1 | 85% |
| b2 | synthetic iid normals, two-asset | 0.29 | normal | 1 | 1 | 85% |
| c | rescaled history, single years resampled iid | 0.29 | **historical** | 1 | 1 | 100% |
| d | equity in historical blocks, bond years shuffled | ≈0 | historical | **0.91** | 1 | 70% |
| e | bonds in historical blocks, equity years shuffled | ≈0 | historical | 1 | **2.66** | 80% |
| f | full forward-block (both in the same blocks) | 0.29 | historical | **0.91** | **2.66** | 100% |

- **a → b1: engine check.** Building iid from the two endpoint assets gives 85% against the curve's 80%, one grid step apart (CE within 0.2%).
- **b1 → b2: correlation.** The curve's correlation (0.30) is now almost history's (0.29), so this step changes nothing: 85%.
- **b2 → c: return shape.** Rescaled equity is right-skewed (+0.85); rescaled bonds have a long left tail from hyperinflations (skew −1.06, excess kurtosis 11, worst year −8.6 s.d.). Bonds look worse in the tail, and the optimum moves to 100% on this change alone.
- **c → d, c → e: one asset's sequencing.** Keeping one asset's order while shuffling the other's years also removes their correlation (≈0), which by itself favours bonds. With equity sequenced, the optimum falls to 70%: lost correlation plus history's short-run equity momentum (VR(2y) ≈ 1.1). With bonds sequenced it is 80%: persistent bonds without the correlation do not reach 100% either.
- **c → f: both together.** Sequencing both assets in the same simulated years, with history's correlation, is back at 100%: sequencing adds little once the return shape is in. Which ingredient decides depends on funding. At the ~3.0% draw of the $200k / $15k row in §2f, shape alone gave 80% and only the joint structure reached 100% (`--savings 200000 --contrib 15000`).

### 3c. Era and country cuts

Each cut restricts the history before rescaling, so only the sequencing changes. VRs are on arithmetic returns (what the engine samples). `bond iid null` is the mean and 5th–95th percentile of bond VR(10y) after shuffling years within each country, since short samples bias VR below 1 even for iid data. That shuffle treats the 16 countries as independent. Where the panel is balanced (post-1950, 1990–2020), a **common-year null** applies the same shuffle of calendar years to every country, which keeps their co-movement and gives the honest width. Bills (short-term government paper) are shown for comparison.

| History | bond VR(10y) | bond iid null | bill VR(10y) | equity VR(10y) | best constant | CE gain vs 100% |
| --- | --- | --- | --- | --- | --- | --- |
| full 1871–2020 | 2.66 | 1.00 [0.87, 1.15] | 3.29 | 0.91 | 100% | — |
| post-1950 | 2.21 | 0.94 [0.78, 1.09]; common-year 0.93 [0.65, 1.28] | 4.97 | 0.91 | 100% | — |
| ex Germany + Japan | 2.54 | 0.99 [0.85, 1.13] | 3.63 | 0.94 | 100% | — |
| stable six¹ | 1.92 | 0.96 [0.77, 1.19] | 3.23 | 0.73 | 100% | — |
| 1990–2020 | **0.58** | 0.82 [0.61, 1.08]; common-year 0.79 [0.44, 1.35] | 3.85 | 0.69 | **80%** | +0.9% |

¹ USA, UK, Canada, Australia, Switzerland, Sweden. JST has no return data for Canada, so five countries contribute.

- **Not a disaster artifact.** Dropping Germany and Japan leaves bond persistence about the same (2.54 vs 2.66).
- **Era-dependent for bonds.** In 1990–2020 bond persistence disappears and stock/bond correlation falls to ≈0 (0.06), and the interior optimum returns. That is one 31-year regime (about three independent decades), and it ends before the 2021–22 inflation shock. §4b explains why.
- **The 1990–2020 bond VR is consistent with iid, not evidence of mean reversion.** 0.58 sits at the 2nd percentile of the within-country null but only the ~23rd of the common-year null, because the 16 countries' bond markets moved together. It is below 1 in all 16 countries (0.13–0.86) and in every nearby window (0.41–0.74 for 1980/1985/1995 starts or 2010/2015 ends), so the loss of persistence is robust; the reversion beyond iid is not. The full-history and post-1950 persistence (2.66, 2.21) lie far outside either null.
- **The ~80% optimum comes from correlation, not sequencing.** Drawing the same 1990–2020 years independently instead of in blocks still gives 70% (`--sections era-seq`); block sequencing only flattens the curve (100% costs ~0.9% of CE with blocks, ~2.7% without). In the full history the optimum is 100% either way, but sequencing widens 100%'s lead over 90% from $0.1k to $0.6k.
- **Bills stay persistent in every era** (VR 3.2–5.0), through lagging inflation in the long samples and the policy-rate cycle in 1990–2020 (§4b). Short duration removes neither.

### 3d. Welfare regret across regimes (robustness check)

A weight's **regret** in a regime is that regime's best constant CE minus the weight's CE; **maximum regret** is the most it could cost if you don't know which regime is true. `research_history --sections regret` (constant dollar, 30y + 30y); cells in $/yr of CE income:

| Regime (forward-block unless noted) | best | 60%   | 70%   | 80%   | 90% | 100%    |
| ----------------------------------- | ---- | ----- | ----- | ----- | --- | ------- |
| full 1871–2020                      | 100% | 4,204 | 2,674 | 1,480 | 612 | 0       |
| post-1950                           | 100% | 3,633 | 2,267 | 1,238 | 494 | 0       |
| ex Germany + Japan                  | 100% | 4,043 | 2,593 | 1,447 | 597 | 0       |
| stable six                          | 100% | 3,339 | 1,837 | 852   | 275 | 0       |
| 1990–2020                           | 80%  | 604   | 109   | 0     | 143 | 477     |
| iid-mc                              | 80%  | 858   | 239   | 0     | 70  | 232     |
| **max regret**                      |      | 4,204 | 2,674 | 1,480 | 612 | **477** |

Any weight from 90% to 100% loses at most ~1.2% of CE in any regime ($612 ≈ 1.2% of ~$50k, for 90% in the full history); 80% costs up to $1,480 (3.0%) there. 100% has the smallest worst case ($477/yr, in 1990–2020), with or without iid (its regret if iid is right is $232). The iid-optimized glide has a maximum regret of $1,366. This is a robustness check, not a product rule.

---

## 4. The bond menu

§2 and §3 use long nominal bonds as the only safe asset, so flat 100% equity under historical sequencing (§3a) is partly a verdict on that bond. This section asks which bond property drives the result, and whether a real bond changes it. Equity keeps forward-block sequencing throughout, and figures are constant-weight CE income unless marked as a glide path.

**In short:**

- **Nominal bonds keep the optimum at 100% equity** at both funding levels: the default plan ($100k saved, $15k a year, 3.5% first-year draw) and an overfunded plan ($200k / $20k, 2.6% draw).
- **Removing the bond's historical baggage** (correlation with equity, persistence, the fat left tail) moves the best weight to 70% at the default and 45% overfunded. That is an idealized real asset (cell b in §4a).
- **The realistic leg** (1.00% real mean, 3.0% volatility, persistence φ 0.30, equity correlation 0.29) leaves the default plan at 100% equity. Overfunded, it moves the best weight to 55% and adds about $1,000 a year (~1.7% of CE) over nominal bonds (§4c).
- **The result depends on the real mean.** At 2.00%, the default moves to 60% and the overfunded plan to 30%. Both means sit below the 2.64% 5-year TIPS yield (12 Nov 2026). The lean strengthens as the mean rises, so 1.00% is the most equity-heavy point tested on this leg (§4c).

### 4a. The menu

Constant dollar, 30 years of saving and 30 of retirement (`research_history --sections menu`):

| Non-equity asset | Default: best weight | CE | Overfunded: best weight | CE |
| --- | --- | --- | --- | --- |
| a) long nominal bonds, historical sequencing | 100% | $50.0k | 100% | $57.1k |
| b) idealized real asset: bond mean and volatility (1.81% / 5.39%), iid, zero equity correlation | **70%** | $51.1k | **45%** | $59.3k |
| c) idealized real ladder, 2% volatility | 55% | $51.8k | 15% | $60.0k |
| d) as c, with a 2.0% real mean | 45% | $53.1k | 10% | $60.0k |

Cell b removes what makes long bonds fail, all at once: correlation with equity, persistence and the fat left tail. It keeps the bond's mean and volatility.

Cells c and d are upper bounds. Their 2% volatility is what a hold-to-maturity ladder delivers and no fund does. They show that the bond choice matters most when a plan is well funded: at $200k / $20k a 2% real asset is nearly riskless against a 2.6% draw, so the optimizer holds mostly bonds.

### 4b. Why long nominal bonds fail

A real bond's return splits into carry (its starting yield), price (the rate cycle) and inflation. Summing each term's contribution to bond VR(10y) gives the total exactly (`--sections bond-decomp`). Over 1871–2020 inflation supplies about two-thirds of bond persistence (1.81 of 2.66). After 1950 the rate cycle is larger than inflation (1.12 against 0.85). In 1990–2020 both shrink: inflation's contribution is about zero and bond VR is 0.58. This is variance accounting, not a causal split. Inflation targeting is the likely **condition** for bond VR ≈ 1 or below, not a demonstrated cause; 31 years cannot separate it from the falling-rate backdrop.

Short duration does not remove the problem. Real bill returns are _more_ persistent than long bonds (VR(10y) 3.29 vs 2.66), because bill rates lag inflation, and in 1990–2020 the rate term alone is 124% of bill persistence. A bill-ladder leg with a 0.75% real mean has a best constant weight of **100%** (`--sections bills-block`). Short duration helps with near-term sequence risk, but long duration earns a term premium that rallies in deflationary crashes and falls with equities in inflationary ones, as in 2022.

### 4c. Realistic real bonds: what a fund could deliver

Cell b is idealized. Set against a short real fund, it is generous on three counts and conservative on one:

- **Correlation.** Zero with equity, against 0.29 for nominal bonds historically and 0.30 in the iid curve. A short linker still falls with equities when real yields jump, as in 2022.
- **Persistence.** None. VTIP's annual returns since 2012 give φ ≈ 0.13, but on about 13 observations (standard error ≈ 0.27), so anything from 0 to about 0.5 fits. A short linker tracks the real short rate, which is persistent (§4b).
- **Mean.** The bond leg's 1.81% real includes a term premium a short fund does not earn.
- **Volatility (conservative).** Cell b keeps the long bonds' 5.39%. A short fund is calmer, which would favour bonds more.

The **realistic leg** combines a 1.00% real mean, 3.0% volatility, φ 0.30 and equity correlation 0.29. Three of its four changes make the bond less attractive than cell b: the correlation, the persistence and the mean. The fourth, 3.0% volatility, makes it more attractive, since a calmer fund is easier to hold. The 1.00% mean is set deliberately low: it sits 1.6 points below the 5-year TIPS real yield of 2.64% (12 Nov 2026, [FRED DFII5](https://fred.stlouisfed.org/series/DFII5)). The 2.00% rows test a mean still 0.6 points below that yield. `--sections tips-stress` changes one assumption at a time from cell b, at each funding level:

| Change to cell b | Default: best constant | CE | gain | Overfunded: best constant | CE | gain |
| --- | --- | --- | --- | --- | --- | --- |
| none (cell b) | 70% | $51,371 | +$1,415 | 45% | $59,345 | +$2,281 |
| equity correlation 0.29 | 80% | $50,282 | +$326 | 50% | $58,658 | +$1,594 |
| equity correlation 0.50 | 95% | $49,961 | +$5 | 55% | $58,069 | +$1,005 |
| persistence φ = 0.30 | 75% | $51,216 | +$1,260 | 55% | $59,061 | +$1,997 |
| persistence φ = 0.50 | 75% | $51,106 | +$1,150 | 60% | $58,862 | +$1,798 |
| persistence φ = 0.80 (near random-walk real rate) | 80% | $50,865 | +$909 | 70% | $58,546 | +$1,482 |
| mean 1.00% real | 95% | $49,991 | +$35 | 60% | $58,287 | +$1,223 |
| mean 2.00% real | 65% | $52,042 | +$2,086 | 40% | $59,525 | +$2,461 |
| volatility 3.0% | 60% | $51,829 | +$1,873 | 25% | $59,860 | +$2,796 |
| combined realistic leg: 1.00% / 3.0% / φ 0.30 / corr 0.29 | 100% | $49,956 | +$0 | 55% | $58,032 | +$968 |
| combined realistic leg: 2.00% / 3.0% / φ 0.30 / corr 0.29 | 60% | $51,562 | +$1,606 | 30% | $59,649 | +$2,585 |
| harsh: 1.00% / 5.39% / φ 0.50 / corr 0.50 | 100% | $49,956 | +$0 | 85% | $57,185 | +$121 |

Default gains are over the default nominal baseline ($49,956). Overfunded gains are over that run's nominal baseline ($57,064, 100% equity). A separate constant-weight check puts 100% equity at $56.8k on the overfunded history, about $250 below this baseline, so overfunded gains may be understated by about that much. The default "none" row differs from §4a's $51,132 by about 0.5%, from a separate run.

- **Persistence alone does not pin the optimum at 100%.** φ = 0.80 gives 80% at the default and 70% overfunded.
- **At the default, the mean and the correlation do.** A 1.00% real mean or a 0.50 correlation alone takes the optimum to 95%, with a gain of about $0. The 3.0% volatility works the other way and favours bonds (60% at the default, 25% overfunded). The combined realistic leg lands at 100%, no better than nominal bonds.
- **At overfunded savings every single change keeps a gain** of $1,005–2,796 a year, and the combined realistic leg keeps $968. The harsh case, with full bond volatility and correlation 0.50, keeps $121.
- **Raising the mean to 2.00% changes the default.** The mean alone moves the default to 65% (+$2,086 over nominal) and overfunded to 40% (+$2,461). The combined leg moves the default to 60% (+$1,606, about 3.2% of CE; the 1.00% leg gives $0) and overfunded to 30% (+$2,585). Both funding levels still prefer some real bonds at this mean.
- **Glide path, overfunded, combined leg.** The optimized glide reaches CE $58,345, about 0.5% above the best constant weight (55%, $58,032). It reads 100 / 80 / 55 / 65 / 45 / 45 / 45 / 60 / 65 / 80 / 100 / 95 at 5-year steps from age 35: it sits at 45% from age 55 to 65 and rises afterwards.
- **Not modelled:** the ~3-month indexation lag, hedging costs and fees. A US-CPI-linked fund also hedges only part of Canadian inflation (§4d).

**Realistic reading.** Whether a real bond earns a place depends on funding and on the real mean. At 1.00% and the default ($100k / $15k), the realistic leg earns nothing over nominal bonds: 100% equity stays best, and in 1990–2020 it costs 0.5–0.9% of CE (§4d). At overfunded savings ($200k / $20k) it moves the best constant weight to 55% and adds about $1,000 a year (1.7% of CE) over nominal bonds, and the glide adds about 0.5% on top. At 2.00%, the default moves to 60% (+$1,606 a year over nominal) and the overfunded plan to 30% (+$2,585). The 1990–2020 cost has been run only at 1.00%, where the realistic leg costs about 0.5% at overfunded savings. Treat a real sleeve as a hedge against inflation regimes, not a free gain.

### 4d. Blending nominal and real bonds

Setup:

- The bond sleeve is (1 − s) nominal bonds plus s real bonds, rebalanced annually. s is the real share.
- The real legs are **idealized** (§4a cell b) and **realistic** (§4c's combined leg).
- Both histories (full and 1990–2020) are rescaled to the same forward anchors, so they differ only in volatility, correlation and sequencing.
- Constant equity weights, constant dollar, 30y + 30y, 8,000 paths (`--sections sleeve-blend regime-mix`). Seed-to-seed CE noise is ≤ 0.4%.

**Sleeve blend, full history.** Best constant weight and CE at each real share:

| Real share s | Default: idealized leg | Default: realistic leg | Overfunded: idealized leg | Overfunded: realistic leg |
| --- | --- | --- | --- | --- |
| 0 (nominal only) | 100%, $49.9k | 100%, $49.9k | 100%, $56.8k | 100%, $56.8k |
| 0.25 | 100%, $49.9k | 100%, $49.9k | 80%, $57.0k | 100%, $56.8k |
| 0.5 | 90%, $50.0k | 100%, $49.9k | 50%, $57.8k | 80%, $57.0k |
| 0.75 | 80%, $50.4k | 100%, $49.9k | 40%, $58.8k | 60%, $57.5k |
| 1 (real only) | 70%, $51.2k | 100%, $49.9k | 50%, $59.3k | 60%, $57.9k |

- **Overfunded, a real sleeve on the realistic leg earns its place.** Full-history CE rises from $56.8k with nominal bonds to $57.9k with an all-real sleeve at 60% equity (+1.9%). The all-real sleeve on the idealized leg adds 4.3%, but that leg is less realistic.
- **At the default, a real sleeve on the realistic leg never earns its place.** 100% equity is best at every real share.
- **1990–2020 is a smaller effect.** At the default the sleeve on the idealized leg adds 0.7–1.7% of CE and the sleeve on the realistic leg costs 0.5–0.9%. Overfunded, every sleeve lands within about 0.5% of the nominal-only CE ($59.9k), with best weights of 30–60%.
- **The real share sets the equity weight.** Nominal bonds do not hedge inflation regimes, so equity does that job (100% in the full history). An all-real sleeve lowers the best weight to 70% at the default and 50% overfunded in the idealized case. The realistic case gives 100% and 60%.

**Regime mixture.** Each simulated lifecycle lives in the 1990–2020 regime with probability p and otherwise in the full history. Regret is the largest CE shortfall over p from 0 to 1, as a percentage of the best CE for that p. (A switch-over version, which redraws the regime each year with probability 1/30, gives nearly the same numbers.)

Default funding:

| Sleeve                 | 50%   | 60%  | 70%            | 80%  | 90%  | 100%     |
| ---------------------- | ----- | ---- | -------------- | ---- | ---- | -------- |
| nominal only (s = 0)   | 12.2% | 8.6% | 5.6%           | 3.2% | 1.3% | **0.9%** |
| realistic leg, s = 0.5 | 10.1% | 6.7% | 4.0%           | 2.1% | 0.8% | **0.0%** |
| realistic leg, s = 1   | 13.6% | 7.6% | 3.9%           | 1.8% | 0.6% | **0.0%** |
| idealized leg, s = 1   | 3.1%  | 0.6% | **0.0%** (70%) | 0.5% | 1.5% | 2.8%     |

Overfunded ($200k / $20k):

| Sleeve | 50% | 60% | 70% | 80% | 90% | 100% |
| --- | --- | --- | --- | --- | --- | --- |
| nominal only (s = 0) | 4.35% | 2.50% | 1.42% | 0.67% | **0.42%** (90%) | 0.75% |
| realistic leg, s = 0.5 | 0.65% | **0.19%** (60%) | 0.20% | 0.32% | 0.52% | 0.77% |
| realistic leg, s = 1 | 0.13% | **0.00%** (60%) | 0.23% | 0.65% | 1.21% | 1.86% |
| idealized leg, s = 1 | **0.00%** (50%) | 0.35% | 0.93% | 1.74% | 2.83% | 4.14% |

- **Overfunded:** the all-real sleeve on the realistic leg at 60% equity has zero regret in every regime mix tested. Nominal bonds do best at 90% equity, with a maximum regret of 0.42%.
- **Default:** 100% equity is robust under both nominal and realistic-leg sleeves, with regret of at most 0.9%.

**US versus Canadian inflation.** A real bond linked to US CPI hedges only part of Canadian inflation. `--sections cpi-basis` measures the **hedged share** as 1 − Var(US − CA) / Var(CA) on cumulative log inflation:

| Era            | 1y  | 5y  | 10y | Canadian 10y inflation s.d. |
| -------------- | --- | --- | --- | --------------------------- |
| full 1871–2020 | 70% | 87% | 92% | 26.6%                       |
| post-1950      | 85% | 92% | 94% | 23.5%                       |
| 1965–1985      | 75% | 86% | 88% | 14.9%                       |
| 1990–2020      | 50% | 18% | 20% | 2.0%                        |

Where inflation matters, a US-CPI-linked real asset hedges about 90% of Canadian 10-year inflation, leaving roughly a tenth unhedged. The 1990–2020 share is low because Canadian inflation barely moved, so there was little to hedge.

**Verdict.** A real bond sleeve is insurance against inflation regimes, not a free gain. At 1.00% and the default funding, a real sleeve on the realistic leg is not worth holding. At overfunded savings, an all-real sleeve on the realistic leg at 60% equity is worth about 1.9% of CE over nominal bonds in the full history, with no regret across the regime mix. The sleeve and regime tables use the 1.00% mean only. At 2.00%, the tips-stress optimum moves further toward bonds (§4c), but the sleeve gain at 2.00% has not been computed.

---

## 5. Comparison with ACO and ERN

- **ACO**: Anarkulova, Cederburg & O'Doherty, _Beyond the Status Quo_ ([SSRN 4590406](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4590406)). This section reads the working paper dated December 6, 2024 (SSRN refused automated fetches; the text came from the AEA PDF). A later version may differ. A block bootstrap of a monthly 39-country panel (Global Financial Data, 1890–2023; domestic stocks, international stocks, bonds, bills) finds an optimal fixed weight of 100% equity (33% domestic, 67% international, 0% bonds and bills). Its base case holds one allocation for life, and its age-based and valuation-based variants add little.

**ACO's investor profile** (working paper §4.1–4.4):

- A couple of equal age, saving from age 25 with zero starting wealth and retiring at 65 (40 working years). Saving is 10% of labor income, none below $15,000 (2022 USD). Labor income follows Guvenen, Karahan, Ozkan & Song (2021), with persistent AR coefficient ρ = 0.96.
- Retirement draws 4% of the balance at retirement, then inflation-indexed. This is the main difference from our tool: the spending target scales with wealth, so a funding shortfall of the kind our fixed $60k target creates never arises, and no funding tent appears.
- Social Security (2022 formulas, with spousal and survivor benefits) and SSA period life tables. The couple's 5th and 95th percentile ages at death are 70.8 and 100.
- CRRA utility over consumption scaled by √(household size), with δ = 1 and γ = 3.84, plus a De Nardi, French & Jones (2010) bequest term. Pre-retirement consumption is not modeled.
- No leverage and non-negative weights over four assets. Returns come from a stationary monthly block bootstrap with an average block of 120 months, drawing all four assets from the same country-month.
- **ERN**: [earlyretirementnow.com, Part 20](https://earlyretirementnow.com/2017/09/20/the-ultimate-guide-to-safe-withdrawal-rates-part-20-more-thoughts-on-equity-glidepaths/). A US backtest finds a rising retirement glide (e.g. 60%→100%) adds ~0.1–0.3pp to the SWR, but only when CAPE > 20.
- **Kitces & Pfau** (2014): a rising equity glide through retirement beats a constant or declining one on success rate, by reducing exposure in the early, sequence-sensitive years.

| Claim | Verdict |
| --- | --- |
| ACO: ~100% equity, flat | **Reproduced** under forward-block, and under iid for flexible spending or a tightly funded plan. For a rigid spender under iid at the default funding, a ~60% tent beats 100% by ~1.4% at 30 years, less at longer horizons. |
| ERN / Kitces–Pfau: rising retirement glide | The derisk-then-rise shape appears under iid with rigid spending, and largely vanishes under forward-block. ERN's SWR boost does **not** reproduce under iid (§2a): the rising glide only ties the best constant weight. |
| Both: beat a declining (target-date) retirement glide | Direction agreed, magnitude small: the glide shape is worth ≤ ~1% of CE. |

**Why our iid path differs from ACO's.** ACO stays at ~100% through accumulation; our iid constant-dollar path falls into the tent. Two levers each close the gap on their own: historical returns, shape and sequencing (§3), and less overfunding (§2f). The third difference is the objective: ACO also values terminal wealth, which removes the "wasted upside" of a capped spender. The fourth is the spending rule: ACO draws 4% of wealth at retirement, while our fixed target creates the funding shortfall that the tent protects against. ACO uses Global Financial Data rather than JST, but the two cover largely the same markets and events, so reproducing ACO is a consistency check, not independent confirmation.

**Bond persistence in ACO.** ACO reports bond VR(10) of 1.88 on actual data and 2.16 in its 10-year-block bootstrap. Excluding war and hyperinflation years, our full-history bond VR(10y) is 2.06 (1.77 demeaned), close to ACO's figures; with them it is 2.66. ACO's only era cut is post-WWII (1945–2023), which still gives 100% equity. It does not test an inflation-targeting or post-1990 period, so §4b's 1990–2020 result (bond VR 0.58) has no counterpart in ACO.

**Real bonds in ACO.** A footnote (untabulated) adds TIPS, simulated as fitted values from a regression of a TIPS fund (VIPSX, 2000–2023, R² 66%) on ACO's four assets plus noise, and finds zero weight. That proxy is built from nominal bonds and stocks, so it inherits their inflation exposure; it does not test an asset whose real value is fixed, which is what §4a's idealized and §4c's realistic real legs model.

---

## 6. Caveats

- **iid has no valuation signal or mean reversion.** It cannot reproduce ERN's CAPE effect, and it overstates the case for derisking if history's recoveries persist. Neither engine models valuation timing.
- **The sequencing evidence is statistically weak.** 150 years × 16 correlated countries amount to a handful of independent 60-year lifecycles, and equity VR(10y) ≈ 0.91 is probably not distinguishable from 1. Read §3 as one end of a range, not a point estimate.
- **Which era describes the next 60 years** (full-sample or 1990–2020 structure) is a judgment about monetary regimes the data cannot settle.
- **Survivorship.** JST covers markets that survived with usable data; the recoveries behind §3 partly reflect that.
- **Sequencing is assumed independent of the return level.** Forward-block applies history's crash-and-recovery patterns to a lower forward equity premium. If those patterns came partly from history's higher returns, forward-block overstates them.
- **One equity asset, two-asset menu.** No domestic/international split.
- **iid bonds** have a fixed 0.30 stock correlation (about history's 0.29) and no inflation risk or persistence (bond-friendly).
- **Real-leg inputs are assumptions, not estimates.** The realistic leg's 1.00% and 2.00% real means both sit below the 5-year TIPS yield (2.64% on 12 Nov 2026), and the sleeve and regime tables use 1.00% only. The idealized leg's 1.81% mean is generous. Neither leg has a track record, and a 0–5 year fund's yield will differ from the 5-year point.
- **Fixed horizon, no mortality weighting, bequest optional and off by default, fixed contributions, no taxes or fees, annual rebalancing, discrete grid.** Read the direction and rough size, not basis points.

---

## 7. Code and reproduction

**Python** (`analysis/glide_path/`): module roles, API and run commands are in its [README](../../analysis/glide_path/README.md). Research code can pass `history=` (a custom or cut return series) and `sampler=` (a custom index sampler) to `recommend_glide_path`.

**Web** (`src/utils/glide-path/`): `engine.ts` (the same model, one simulation kernel for iid and forward-block), `recommendation.ts` (simplicity rule), `jstData.ts` (generated bundle). The app offers iid-mc and forward-block and requires ≥ $10k of guaranteed income from its start age. It fixes 5-year steps, θ = 0 (no bequest weight), one equity ceiling for all years and 2.1% inflation; those stay adjustable in Python.

**CLI.** `python3 analysis/recommend_glide.py -i` prompts for every input and prints the equivalent command. `--guaranteed-start-age AGE` (with `--start-age`) sets the bridge, `--bequest-weight θ` and `--bequest-offset k` the bequest term (the interactive "Leave money to heirs?" prompt maps none / some / strong to θ = 0 / 0.25 / 0.5), and `--compare-modes` prints one table across iid-mc, forward-block, historical-block and historical-block restricted to 1990–2020.

Where each result comes from (`research_history` sections are passed as `--sections <name> ...`):

| Note section | Source |
| --- | --- |
| §2a–§2e | `research` |
| §2f | `research_history` `funding` |
| §3a | `recommend_glide_path(..., interval=1, return_mode="forward-block", n_paths=15_000)` |
| §3b | `matrix`, `blocks`, `channels` |
| §3c | `vr` (variance ratios and nulls), `regret` (best constant per cut), `era-seq` (block vs iid draws) |
| §3d | `regret` |
| §4a, §4b, §4c | `menu`, `tips-etf`, `bills-block` |
| §4b | `bond-decomp` |
| §4c | `tips-stress` |
| §4d | `sleeve-blend`, `regime-mix`, `cpi-basis` |
| γ checks (§2d) | `gamma` |

```bash
python3 -m analysis.glide_path.research               # §2 tables + figures (~5 min)
python3 -m analysis.glide_path.research_history --sections matrix blocks channels menu \
    tips-etf tips-stress sleeve-blend regime-mix cpi-basis bills-block gamma vr \
    bond-decomp regret funding era-seq \
    --accum 30 --retire 30 --savings 100000 --contrib 15000 --interval 5 --paths 8000
python3 -m analysis.glide_path.research_history --sections menu tips-stress sleeve-blend regime-mix \
    --accum 30 --retire 30 --savings 200000 --contrib 20000 --interval 5 --paths 8000   # overfunded §4a, §4c, §4d
python3 -m analysis.glide_path.doc_figures  # variance-ratio, block-bootstrap and bond-persistence SVGs (light and dark)
python3 -m analysis.glide_path.generate_bundle         # regenerate src/utils/glide-path/jstData.ts
```

Historical modes download JST R6 to the gitignored `analysis/.data/` on first use (needs pandas and openpyxl; the figures also need matplotlib).

---

## References

- Anarkulova, Cederburg & O'Doherty (2023) — _Beyond the Status Quo: A Critical Assessment of Lifecycle Investment Advice_ ([SSRN 4590406](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4590406)).
- Early Retirement Now (2017) — [Safe Withdrawal Rate Series, Part 20](https://earlyretirementnow.com/2017/09/20/the-ultimate-guide-to-safe-withdrawal-rates-part-20-more-thoughts-on-equity-glidepaths/) (equity glidepaths).
- Kitces & Pfau (2014) — "Reducing Retirement Risk with a Rising Equity Glide Path", _Journal of Financial Planning_.
- Estrada (2014) — "The Glidepath Illusion: An International Perspective", _Journal of Portfolio Management_.
- Jordà, Knoll, Kuvshinov, Schularick & Taylor (2019) — "The Rate of Return on Everything, 1870–2015", _QJE_ 134(3). This note uses the JST Macrohistory Database R6, which extends the series to 2020.
- VTIP annual returns — Vanguard's published annual total returns.
- FRED, 5-Year Treasury Inflation-Indexed Security, constant maturity (DFII5), [fred.stlouisfed.org/series/DFII5](https://fred.stlouisfed.org/series/DFII5): 2.64% on 12 Nov 2026, accessed 16 Nov 2026.
- Lo & MacKinlay (1988) — "Stock Market Prices Do Not Follow Random Walks: Evidence from a Simple Specification Test", _Review of Financial Studies_ 1(1) (the variance-ratio test).
- Politis & Romano (1994) — "The Stationary Bootstrap", _JASA_ 89(428).

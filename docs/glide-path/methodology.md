# Lifecycle Allocation — Methodology

Research note for Lifecycle Allocation (`/glide-path`). The question: **what equity weight should a household hold at each age, before and after retirement?** It is the open question of asset allocation over the lifecycle (age-in-bonds rules, target-date funds, rising glides or one constant mix), tested with simulation and market history.

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
- [4. Real versus nominal bonds](#4-real-versus-nominal-bonds)
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
5. **Flat 100% is partly a verdict on long nominal bonds: their bad years came at the wrong time.** Most fell in wars and inflations that also hit stocks (§4a). A long real bond earning 1.50% after inflation, 0.3pp below the nominal bond, leaves the default plan at 97–100% equity and moves an overfunded plan ($200k / $20k, 2.6% draw) to 65–70%, worth 0.8–1.4% of CE. At 1.00% it is worth at most 0.5% of CE; at 2.00%, up to 1.0% for the default plan and 2.5% overfunded. Each range runs from the real-bond proxy, which keeps history's interest-rate cycle, to the simulated real bond, whose bad years rarely coincide with stocks' (§4c).
6. **Mixing in real bonds is insurance, not a free gain.** Real bonds help over the full history (item 5) but cost 0.7–0.9% of CE in 1990–2020, when nominal bonds did well. Their main benefit is a smaller worst case when the regime is unknown: at most 0.2% of CE lost, against 0.4–0.9% with nominal bonds only (§4d).
7. **Guessing the regime wrong costs little.** Any constant weight from 90% to 100% costs at most ~1.2% of CE in any regime tested (80% costs up to ~3%; §3d), so a weight between the two models' answers is a safe choice.
8. **γ barely matters with constant-dollar spending.** Consumption is then almost always the full target or the guaranteed floor, so every γ ranks allocations the same way (§2d).

The app recommends what the selected model's simulation produces: the optimized glide, or the best constant weight unless the glide is clearly better (§1.5). Run both return models (`--compare-modes` in the CLI, or **Return model** under Simulation in the app), since they can disagree on the best constant weight by 20pp (80% under iid, 100% under forward-block).

---

## Applying this

- **Leverage earns little.** In a young-saver case (age 30, $100k saved, $20k/yr for 30 years, $70k target), allowing up to 150% equity raised CE by under 1% ($150–290/yr) in both models, and the optimizer used it only in the first decade (the first 5 years under iid, the first 10 under forward-block). That is inside the model's own uncertainty and ignores margin calls, rate changes and behaviour. Treat equity above ~110% as unrewarded.
- **An overfunded plan has no best allocation.** When every constant weight already delivers the target (both engines flag this), the allocation does not change income and the reported weight is the middle of a tie. Decide what the surplus is for: leave it (a bequest weight, Python `--bequest-weight` only) or use it (retire earlier or spend more).
- **Bequest weight (Python only; the web app fixes θ = 0).** A weight θ of 0.25 or 0.5 gives money left at the end some value (§1.4). With γ = 4 a large estate adds little utility, so θ barely moves a plan that needs its money. In an overfunded plan it breaks the tie: 55–60% equity in retirement, instead of a ~50% tie midpoint in our test.
- **Guaranteed-income start age.** A start age after retirement models a bridge: the portfolio funds the whole target until CPP/OAS/DB begins (§1.1). Retiring at 60 with $20k from 65 cost about 9% of CE ($38.8k → $35.4k) against the same income from 60, and raised full-path shortfall from 34% to 41% (25 years of saving, a 35-year retirement, iid).
- **The app's bonds are nominal.** Its bond asset is the forward curve's bond (iid) or JST long government bonds (forward-block). Real-return bonds are research only (§4). If your bonds are mostly real-return bonds, see §4c. At a 1.50% real return the default plan stays near 100% equity and an overfunded plan moves to 65–70%, for a gain of at most 1.4% of CE. The gain is smaller if real bonds fall with stocks in the next crisis.

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
| **AR(1), φ** | Each year's deviation from the mean is φ times last year's plus fresh noise. φ > 0 means persistence. Over long horizons VR approaches (1+φ)/(1−φ); at 10 years it is lower (about 1.7 at φ = 0.30). |

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
| **Bond sleeve** | The non-equity part of the portfolio; §4d mixes real and nominal bonds in it. |
| **Simulated real bond** | §4's favourable version of a real-return bond: a simulated series with a chosen real return, 5.5% volatility, a 0.30 correlation with stocks and mild persistence. Its bad years rarely land with stocks' (§4c). |
| **Real-bond proxy** | §4's less favourable version: the historical JST bond without its inflation losses, rescaled to a chosen return and volatility. It keeps history's timing against stocks (§4a). |
| **TIPS / RRB** | Inflation-linked government bonds: US Treasury Inflation-Protected Securities and Canadian Real Return Bonds. VTIP is a US short-TIPS ETF. |
| **JST** | The Jordà–Schularick–Taylor Macrohistory database (R6): annual returns for 16 countries with both stock and bond series, 1871–2020. |
| **ACO** | Anarkulova, Cederburg & O'Doherty, whose block-bootstrap study recommends ~100% equity for life (§5). |
| **ERN, CAPE** | Early Retirement Now, a blog series on safe withdrawal rates (§5). CAPE is the cyclically adjusted price/earnings ratio, a valuation signal. |

---

## 1. Model

**In brief.** A household saves, retires and spends. Each year its portfolio is split between one equity asset and one bond asset at that age's equity weight. The optimizer picks the weights that maximize the expected utility of retirement consumption. All amounts are real dollars.

### 1.1 Household and phases

- **Accumulation:** the starting balance plus fixed real contributions, made mid-year. Consumption while working does not depend on the allocation, so the accumulation allocation matters only through the wealth it hands to retirement.
- **Retirement:** a fixed horizon, with no mortality weighting. The portfolio funds the gap between the target and guaranteed income, withdrawn mid-year. Wealth left at the end is worth nothing unless a bequest weight is set (§1.4).
- **Guaranteed-income start age:** guaranteed income starts at retirement by default. A later start models a _pre-pension bridge_: the guaranteed income is 0 until it starts and the portfolio funds the whole (gross) target. During the bridge, consumption is scored at no less than the guaranteed amount, so a portfolio that runs dry before the pension starts costs utility like a depleted year after it, not −∞; the shortfall is still counted. The app's ≥ $10k guaranteed-income requirement (§1.6) applies from the start age.

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

**Simplicity rule (web app).** The app recommends the constant weight unless the glide beats it by more than 1% on CE income or by more than 1 point on full-path shortfall (`SIMPLICITY_*` in [`recommendation.ts`](../../src/utils/glide-path/recommendation.ts)). With a bequest weight (direct engine calls only; the app fixes θ = 0), the gate still compares spending CE, not welfare CE. The bequest already shapes both allocations through the objective, and welfare CE is unstable for well-funded plans: it inverts u near the CRRA bound, so a 0.1% spending-CE gap can show as a 4–5% welfare-CE gap.

The 1% gate sits above Monte Carlo noise (~0.3%) and at the top of the glide's usual out-of-sample edge (≤ ~1%; §2e), so the glide is recommended only when it beats the constant by more than it usually does. Across 72 input combinations the largest glide edge was 1.7%, and the same plan's CE moved by up to 2.3% between simulation seeds. Every threshold of 2% or more gave the same seed-stable picks. At 1%, combinations with an edge of 1–1.7% get the glide, and near the gate the pick can change with the seed. The default plan under iid is such a case: its glide edge is 0.9% at the app's first seed (constant shown) and 1.3% at the next (glide shown). The constant never added more than 0.3pp of full-path shortfall (calibration notes in the source). The Python CLI has no simplicity rule; it flags the constant weight when its CE beats the glide's by more than 5%. Both always report the raw optimized glide.

**Overfunded plans and ties.** When θ = 0 and every constant weight on the selection sample delivers the target (CE within 0.5% and shortfall under 0.5%), both engines flag the plan as overfunded: the allocation does not change income. Ties among equally good weights (exact or within 1e-12) go to the middle of the tied range, for the optimizer's starting weight and for the best constant weight; a first-wins rule would report 0% equity, a corner the objective did not choose.

**What the app reports.** For each allocation: CE income, drawdown-only and full-path shortfall, the median money left at the end, and the year-1 portfolio draw as a share of that allocation's median retirement balance. When the optimized glide is a single weight (common with flexible spending and tightly funded plans) it is the constant allocation, and the app shows it once. The app states no preference and shows both allocations side by side when the preferred one has a drawdown-only shortfall of 15% or more, or a full-path shortfall of 30% or more; it notes slack when drawdown-only shortfall is under 5% (flexibility below 0.5 only, since shortfall is ~0 by construction above that). A "Test another simulation sample" button reruns the same plan on fresh paths to show how much of the result is Monte Carlo noise.

### 1.6 Scope limits

- **Guaranteed income is required.** Without it, a depleted year drives consumption to ~$0, where CRRA utility plunges toward −∞ and a handful of ruined paths decide the comparison. Raising the floor would invent income; scoring only surviving paths would make every γ agree. The app therefore requires ≥ $10,000 of guaranteed income; Python accepts zero, and its glide-versus-constant comparison is then inconclusive. A bridge is handled by the consumption floor in §1.1.
- **Undetermined allocation.** With flex = 0, no bequest weight and guaranteed income at or above the target, the portfolio cannot change scored consumption, so every allocation ties. This holds with a bridge too, because of the bridge's consumption floor (§1.1). Both engines reject this input.
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
- **b2 → c: return shape.** Rescaled equity is right-skewed (+0.85); rescaled bonds have a long left tail from hyperinflations (skew −1.06, excess kurtosis 11, worst year −8.6 s.d.). Bonds look worse in the tail, and the optimum moves to 100% on this change alone. The shape here is joint: cell c keeps each year's stock and bond returns together, so the bond's worst years stay paired with bad equity years. §4a finds that pairing matters more than the bond's own tail.
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

## 4. Real versus nominal bonds

§2 and §3 give the portfolio one safe asset, a long nominal government bond. Under historical sequencing it earns no place: the best plan is 100% equity (§3a). This section asks why, and whether a real-return bond (one indexed to inflation, like US TIPS or Canadian Real Return Bonds) would do better.

Two plans are tested throughout: the **default** ($100k saved, $15k a year, a 3.5% first-year draw) and an **overfunded** plan ($200k saved, $20k a year, a 2.6% draw). Stocks keep their historical sequencing (forward-block). Each result is the **best constant equity weight**, the single mix with the highest CE income when held for life, and its CE gain over the historical nominal bond. With that bond, both plans hold 100% equity (CE $49,956 and $57,064).

**In short:**

- **Nominal bonds lose because of when their bad years came.** Most fell in wars and inflations that also hit stocks. Their extreme worst years matter little, and their bad decades only somewhat (§4a).
- **A real bond avoids the inflation losses, but not the interest-rate cycle,** which pushed bonds and stocks down together in some decades (§4a).
- **At a 1.50% real return, a real bond barely moves the default plan** and is worth 0.8–1.4% of CE to the overfunded one, at 65–70% equity. At 1.00% it is worth at most 0.5%; at 2.00%, up to 1.0% for the default plan and 2.5% overfunded (§4c).
- **Mixing real and nominal bonds insures against not knowing the regime;** it is not a free gain (§4d).

### 4a. Why nominal bonds earn no place

**Which returns.** Levels come from the forward assumptions, patterns from history. Every bond in the table, the real-bond proxy included, averages the forward nominal bond's 1.81% real return with 5.39% volatility (§1.3), so the rows differ only in pattern. The historical rows use JST's 2,212 country-years of bond returns (16 countries, 1871–2020), rescaled to that level; raw, they averaged 2.18% with 11.85% volatility. Stocks are JST equity history rescaled the same way, to 4.86% real with 11.75% volatility. "History" below therefore means the order, shape and timing of past returns, never their level.

Start from a **simulated bond** with that return and volatility and a 0.30 correlation with stocks, about the historical bond's. Then add history's features one at a time. Best constant equity weight at each step:

| Step | Bond | Default | Overfunded |
| --- | --- | --- | --- |
| 1 | Simulated bond: the historical bond's return, volatility and correlation, but no persistence (VR(10) 1) | 83% | 48% |
| 2 | + bad decades: bad years followed by bad years as often as in history (VR(10) 2.7) | 87.5% | 64% |
| 3 | + history's own yearly bond returns (rescaled), worst years included, but not in the years they happened | 86.5% | 66.5% |
| 4 | The historical bond (rescaled): the same returns, in the years they actually happened | 100% | 100% |
| — | The historical bond without its inflation losses (the **real-bond proxy**, below), still at 1.81% | 95% | 60% |

Steps 1–3 average 10 simulated series, whose answers differ by up to 10pp.

- **Bad decades matter somewhat.** Step 2 adds 4.5pp of equity at the default and 16pp overfunded.
- **The worst years themselves matter little.** Step 3 swaps in history's yearly returns, including the German hyperinflation's −8.6 s.d. year, and moves the answer by at most 2.5pp.
- **Timing matters most.** Steps 3 and 4 have the same returns and similar persistence; only the order differs. In history, 37% of the bond's worst 10% of years were also among stocks' worst 10%, mostly in WWI, the early 1920s, the 1940s and above all the 1970s. In step 3 it is 20% (10% would mean unrelated). History's bond also had its good and bad decades together with stocks: their 10-year returns correlate 0.42, against 0.17 in step 3.
- **Removing inflation separates the bad years, not the bad decades.** Without its inflation losses, the share of the bond's worst years that were also stocks' worst falls from 37% to 23%. But bonds and stocks still had their good and bad decades together (10-year correlation 0.41, against 0.42 with inflation), because of the interest-rate cycle: decades of rising yields hurt both, and decades of falling yields lifted both.
- **So the real-bond proxy helps an overfunded plan, and barely helps the default.** The overfunded plan moves from 100% to 60% equity, the default only to 95%. The weight moves more than CE does: the gain is $823 (1.4% of CE) overfunded and $48 at the default, because an overfunded plan's CE barely changes across a wide range of weights. And this row gives the proxy the nominal bond's 1.81% return; at a more realistic 1.50%, the overfunded plan holds 70% and gains 0.8% (§4c).

**The real-bond proxy.** Real-return bonds did not exist in these crises (UK index-linked gilts start in 1981, US TIPS in 1997). The proxy stands in for them. It keeps the historical bond's interest income and its price changes as yields moved, and drops the loss of real value from inflation (carry + price, in §4b's terms). Here it is rescaled to the nominal bond's 1.81% and 5.39%, to isolate the effect of inflation; §4c rescales it to the returns a real bond might earn (1.00–2.00%, 5.5% volatility). It is rough: historical yields included compensation for expected inflation, and their moves partly reflected changing inflation expectations. A real bond's yield includes neither.

### 4b. Where bond persistence comes from

Why do bond returns come in bad decades? A nominal bond's real return has three parts: **carry** (its starting yield), **price** (gains or losses as yields move, the interest-rate cycle) and **inflation** (the loss of real value). `--sections bond-decomp` splits bond VR(10) into the three parts' contributions, which add up exactly:

- **1871–2020:** inflation supplies about two-thirds (1.81 of 2.66).
- **After 1950:** the rate cycle is larger (1.12, against 0.85 for inflation).
- **1990–2020:** both shrink. Inflation adds about nothing, and bond VR(10) is 0.58, below 1.

This is accounting, not cause and effect. Inflation targeting is the likely **condition** for bond VR near 1 or below, but 31 years cannot separate it from that period's falling rates.

**Short bonds don't escape it.** Real bill returns are _more_ persistent than long bonds (VR(10) 3.29 vs 2.66), because bill rates lag inflation. In 1990–2020 the rate term alone more than accounts for bill persistence (124%). A bill ladder earning 0.75% real still leaves the best weight at **100%** (`--sections bills-block`). Short bonds limit near-term losses, but only long bonds rally in deflationary crashes, and long bonds fall with stocks in inflationary ones, as in 2022.

### 4c. What a real bond is worth

Two versions of a long real bond are tested, each rescaled to the real returns below with 5.5% volatility:

- **Simulated real bond.** Built like step 2 of §4a, with a 0.30 correlation with stocks and milder persistence (VR(10) 1.66, φ = 0.30). Its bad years land with stocks' only as often as that correlation implies, so it is the favourable version.
- **Real-bond proxy** of §4a. Year to year it moves with stocks less (correlation 0.22), but it keeps history's decade-scale timing against them, the interest-rate cycle (10-year correlation 0.41, against 0.17–0.28 for the simulated real bond). So it gains less.

A real bond whose bad years matched stocks' the way the nominal bond's did would gain nothing. No data can say which version the future will resemble.

The real return is an arithmetic average, net of costs. The base is **1.50%**, 0.3pp below the nominal bond's 1.81%. Nominal bonds should pay a small premium for carrying inflation risk, and a Canadian holding real bonds pays fund fees and hedging costs on US TIPS, which also track US rather than Canadian inflation (§4d). 1.00% is the conservative case. 2.00% is the highest tested, still below the 5-year TIPS yield of 2.64% (12 Nov 2026, [FRED DFII5](https://fred.stlouisfed.org/series/DFII5)). Best constant equity weight, and CE gain over the nominal bond:

| Real return | Default: simulated | Default: proxy | Overfunded: simulated | Overfunded: proxy |
| --- | --- | --- | --- | --- |
| 1.00% | 100%, +$0 | 100%, +$0 | 79%, +$279 (0.5%) | 85%, +$97 (0.2%) |
| **1.50% (base)** | 97%, +$20 (0.0%) | 100%, +$0 | 65%, +$793 (1.4%) | 70%, +$443 (0.8%) |
| 2.00% | 80%, +$500 (1.0%) | 85%, +$179 (0.4%) | 53%, +$1,455 (2.5%) | 55%, +$1,040 (1.8%) |

- **The real return decides.** At the 1.50% base a real bond barely moves the default plan and moves the overfunded plan to 65–70% equity, worth 0.8–1.4% of CE. At 1.00% it is worth at most 0.5%. At 2.00% it takes 15–20% of the default plan and about 45% of the overfunded one.
- **History's timing cuts the gain.** Wherever the simulated real bond gains more than $100, the proxy gains 30–65% less, though its best weight differs by only 2–6pp.
- **Persistence matters little.** With none (VR(10) 1, φ = 0), the simulated real bond holds 0–4pp less equity at the default and 4–9pp less overfunded (75%, 57% and 44.5% at the three returns), and its overfunded gain is $37–296 larger.
- **A glide path adds under 1% of CE** over the best constant weight in every case.
- **Precision.** Simulated-real-bond figures average 10 simulated series, whose best weights differ by up to 10pp. CE figures have no standard errors.

### 4d. Mixing nominal and real bonds

The bond sleeve (the non-equity part of the portfolio) holds a share s in the simulated real bond of §4c, at the 1.50% base, and the rest in nominal bonds, rebalanced yearly. Each mix is tested over the full history and over 1990–2020, when nominal bonds did well (`--sections sleeve-blend regime-mix`, 10 simulated series). CE is computed slightly differently here than in §4c, so nominal-only figures differ by under 0.5%.

**Best constant weight and CE by real share:**

| Real share s | Default: full history | Default: 1990–2020 | Overfunded: full history | Overfunded: 1990–2020 |
| --- | --- | --- | --- | --- |
| 0 (nominal only) | 100%, $49.9k | 80%, $53.9k | 100%, $56.8k | 40%, $59.9k |
| 0.25 | 100%, $49.9k | 80%, $53.6k | 100%, $56.8k | 40%, $59.9k |
| 0.5 | 100%, $49.9k | 90%, $53.4k | 80%, $57.0k | 60%, $59.7k |
| 0.75 | 100%, $49.9k | 100%, $53.4k | 70%, $57.4k | 70%, $59.6k |
| 1 (real only) | 100%, $49.9k | 100%, $53.4k | 60%, $57.6k | 80%, $59.5k |

- **Default plan: real bonds never earn a place over the full history.** 100% equity is best at every share.
- **Overfunded: an all-real sleeve adds about $815 (1.4% of CE)** over the full history and lowers the best weight to 60%. With the real-bond proxy instead, it adds about $440 (§4c).
- **In 1990–2020 real bonds cost 0.7–0.9% of CE** (−$505 at the default and −$449 overfunded at s = 1), because nominal bonds did better then.

**Not knowing the regime.** Suppose the future is either the full history or 1990–2020, with unknown odds. A weight's **maximum regret** is the most it can fall short of the best weight for the true odds, as a percentage of the best CE. For each sleeve, the weight with the smallest maximum regret:

| Bond sleeve  | Default: weight (max regret) | Overfunded: weight (max regret) |
| ------------ | ---------------------------- | ------------------------------- |
| Nominal only | 100% (0.90%)                 | 90% (0.42%)                     |
| Half real    | 100% (0.11%)                 | 70% (0.01%)                     |
| All real     | 100% (0.00%)                 | 70% (0.18%)                     |

Real bonds shrink the worst case to 0.0–0.2% of CE, against 0.4–0.9% with nominal bonds only. The stakes are under 1% of CE, so treat this as a tie-breaker. It makes no difference whether each simulated path keeps one regime or switches regime about every 30 years.

**US versus Canadian inflation.** A real bond linked to US CPI only partly hedges Canadian inflation. `--sections cpi-basis` measures the **hedged share** as 1 − Var(US − CA) / Var(CA) on cumulative log inflation:

| Era            | 1y  | 5y  | 10y | Canadian 10y inflation s.d. |
| -------------- | --- | --- | --- | --------------------------- |
| full 1871–2020 | 70% | 87% | 92% | 26.6%                       |
| post-1950      | 85% | 92% | 94% | 23.5%                       |
| 1965–1985      | 75% | 86% | 88% | 14.9%                       |
| 1990–2020      | 50% | 18% | 20% | 2.0%                        |

Where inflation mattered, US-linked bonds hedged about 90% of Canadian 10-year inflation. The 1990–2020 share is low because Canadian inflation barely moved, leaving little to hedge.

**Verdict.** Real bonds are insurance against inflation regimes, not a free gain. At the 1.50% base they earn no place in the default plan. Overfunded, they add 0.8–1.4% of CE over the full history and cost about 0.75% in 1990–2020. A mix makes sense because the two bonds fail in different crises: nominal bonds in the inflations of §4a, real bonds when real yields jump, as in 2022 (they also lagged nominal bonds in the 2008 deflation scare). The mixes were run at 1.50% only, and the 2.64% market yield is untested.

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

**Real bonds in ACO.** A footnote (untabulated) adds TIPS, simulated as fitted values from a regression of a TIPS fund (VIPSX, 2000–2023, R² 66%) on ACO's four assets plus noise, and finds zero weight. That proxy is built from nominal bonds and stocks, so it inherits their inflation exposure; it does not test an asset whose real value is fixed, which is what §4's simulated real bond models.

---

## 6. Caveats

- **iid has no valuation signal or mean reversion.** It cannot reproduce ERN's CAPE effect, and it overstates the case for derisking if history's recoveries persist. Neither engine models valuation timing.
- **The sequencing evidence is statistically weak.** 150 years × 16 correlated countries amount to a handful of independent 60-year lifecycles, and equity VR(10y) ≈ 0.91 is probably not distinguishable from 1. Read §3 as one end of a range, not a point estimate.
- **Which era describes the next 60 years** (full-sample or 1990–2020 structure) is a judgment about monetary regimes the data cannot settle.
- **Survivorship.** JST covers markets that survived with usable data; the recoveries behind §3 partly reflect that.
- **Sequencing is assumed independent of the return level.** Forward-block applies history's crash-and-recovery patterns to a lower forward equity premium. If those patterns came partly from history's higher returns, forward-block overstates them.
- **One equity asset, two-asset menu.** No domestic/international split.
- **iid bonds** have a fixed 0.30 stock correlation (about history's 0.29) and no inflation risk or persistence (bond-friendly).
- **Real-bond inputs are assumptions, not estimates.** The real returns (1.00%, the 1.50% base, 2.00%) are chosen and sit below the 5-year TIPS yield of 2.64% (12 Nov 2026). The base's 0.3pp gap to the nominal bond is a judgment, not a measured premium. Volatility (5.5%) and correlation with stocks (0.30) are held fixed. Persistence φ = 0.30 is a choice too: VTIP's short history gives φ ≈ 0.13 with a standard error of 0.27. Fees and hedging costs enter only through the chosen return, the ~3-month indexation lag is not modelled, and a 0–5 year fund's yield will differ from the 5-year point.
- **The simulated real bond is the favourable version.** Linked to stocks only by a fixed correlation, its bad years rarely land with stocks', and over decades it moves with them less than history's bonds did (10-year correlation 0.17–0.28 against 0.42). The real-bond proxy keeps that timing but is built from nominal yields. Real bonds have no history in the crises of §4a. Since then they have fallen with stocks when real yields jumped (2022) and lagged nominal bonds in a deflation scare (2008). Indexation itself can fail when a government under stress understates its CPI, as Argentina's did in 2007–15.
- **Seed spread.** Simulated bonds are averaged over 10 series (seeds 1–10). Best-weight spreads are reported; CE standard errors are not computed.
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
| §4a, §4c | `real-leg` (both funding levels; 10 simulated series) |
| §4b | `bond-decomp`, `bills-block` |
| §4d | `sleeve-blend`, `regime-mix`, `cpi-basis` |
| γ checks (§2d) | `gamma` |

```bash
python3 -m analysis.glide_path.research               # §2 tables + figures (~5 min)
python3 -m analysis.glide_path.research_history --sections matrix blocks channels vr bond-decomp \
    regret funding era-seq gamma bills-block \
    --accum 30 --retire 30 --savings 100000 --contrib 15000 --interval 5 --paths 8000
python3 -m analysis.glide_path.research_history --sections real-leg --paths 8000   # §4a, §4c: both fundings, 10 seeds in parallel
python3 -m analysis.glide_path.research_history --sections sleeve-blend regime-mix cpi-basis \
    --accum 30 --retire 30 --savings 100000 --contrib 15000 --interval 5 --paths 8000   # §4d, default
python3 -m analysis.glide_path.research_history --sections sleeve-blend regime-mix \
    --accum 30 --retire 30 --savings 200000 --contrib 20000 --interval 5 --paths 8000   # §4d, overfunded
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

"""Capital-market assumptions shared by the research scripts.

Mirrors ``src/utils/allocations.ts``: nominal geometric return and volatility per asset, a
stock-bond correlation, and the yearly rebalanced stock/bond mixes blended from them. Keep the
two in step; ``analysis/tests/test_cma.py`` pins the Python blend to the app's published values.
"""

from __future__ import annotations

import numpy as np

from analysis.shared.returns import arithmetic_to_geometric, geometric_to_arithmetic

CMA_STOCK_RETURN, CMA_STOCK_VOL = 6.4, 12.0  # nominal geometric return %, volatility %
CMA_BOND_RETURN, CMA_BOND_VOL = 3.8, 5.5
CMA_CORRELATION = 0.3


def blend_allocation(equity_weight: float) -> tuple[float, float]:
    """Nominal geometric return and volatility (%) of a yearly rebalanced stock/bond mix.

    The arithmetic means blend linearly, the variance uses the correlation, and the blended
    arithmetic mean is converted back to a geometric return. Mirrors ``blendAllocation`` in
    ``src/utils/allocations.ts``, including the 2-decimal rounding."""
    w = equity_weight
    s_vol, b_vol = CMA_STOCK_VOL / 100, CMA_BOND_VOL / 100
    arith = (
        w * float(geometric_to_arithmetic(CMA_STOCK_RETURN / 100, s_vol))
        + (1 - w) * float(geometric_to_arithmetic(CMA_BOND_RETURN / 100, b_vol))
    )
    vol = float(np.sqrt(
        (w * s_vol) ** 2
        + ((1 - w) * b_vol) ** 2
        + 2 * CMA_CORRELATION * w * (1 - w) * s_vol * b_vol
    ))
    geo = float(arithmetic_to_geometric(arith, vol))
    return round(geo * 100, 2), round(vol * 100, 2)


# (equity weight, nominal geometric %, volatility %) every 10 points, 100% equity first.
CMA_CURVE = [(w / 10, *blend_allocation(w / 10)) for w in range(10, -1, -1)]

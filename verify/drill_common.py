"""Shared machinery for the exam-drill verification.

Every number a drill solution states in its Check step is re-derived here,
independently of the artifact — symbolically where SymPy can and numerically
where it cannot. One PASS/FAIL line per claim.

A module's checks live in `drills_m<n>.py` and are run by `verify_drills.py`.
Nothing in this file knows about any particular module."""
import numpy as np
import sympy as sp
from fractions import Fraction

PASSED, FAILED = [], []


def chk(name, cond, detail=""):
    """Record one claim. `cond` is the independently computed truth of it."""
    (PASSED if bool(cond) else FAILED).append(name)
    print(("PASS  " if cond else "FAIL  ") + name + (("   | " + detail) if detail else ""))


t, tau, n, k, w = sp.symbols('t tau n k omega', real=True)


def seq(vals, n0):
    """A finite sequence as {index: value}, starting at n0."""
    return {n0 + i: v for i, v in enumerate(vals) if v != 0}


def conv_dt(x, h, lo=-60, hi=60):
    """Discrete convolution of two sequences given as {index: value}."""
    y = {}
    for a, xa in x.items():
        for b, hb in h.items():
            y[a + b] = y.get(a + b, 0) + xa * hb
    return {i: v for i, v in y.items() if v != 0 and lo <= i <= hi}


def conv_ct(x, h, ts, lo=-40.0, hi=40.0, npts=400001):
    """Continuous convolution evaluated at the times in `ts`, by quadrature on a
    fine uniform grid. Used only as a numerical cross-check of a closed form."""
    g = np.linspace(lo, hi, npts)
    d = g[1] - g[0]
    hv = np.array([float(h(v)) for v in g])
    out = []
    for time in ts:
        xv = np.array([float(x(time - v)) for v in g])
        out.append(float(np.sum(xv * hv) * d))
    return np.array(out)


def close(a, b, tol=1e-6):
    return abs(complex(a) - complex(b)) < tol


def allclose(a, b, tol=1e-6):
    return np.all(np.abs(np.asarray(a, dtype=complex) - np.asarray(b, dtype=complex)) < tol)

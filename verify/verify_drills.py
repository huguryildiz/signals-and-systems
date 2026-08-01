#!/usr/bin/env python3
"""Independent computational verification of every number stated in the Check
step of an exam drill solution.

The checks themselves live one file per module, `drills_m1.py` ... `drills_m7.py`,
so a module can be written and checked on its own. This file runs all of them in
order and reports the total.

    cd verify && ../.venv/bin/python verify_drills.py
"""
import importlib
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import drill_common as DC

for m in range(1, 8):
    name = "drills_m%d" % m
    print("\n===================================================== Module %d" % m)
    try:
        importlib.import_module(name)
    except ModuleNotFoundError:
        DC.chk("Module %d checks present" % m, False, name + ".py is missing")

print("\n%d passed, %d failed" % (len(DC.PASSED), len(DC.FAILED)))
if DC.FAILED:
    print("FAILURES:", DC.FAILED)
    raise SystemExit(1)

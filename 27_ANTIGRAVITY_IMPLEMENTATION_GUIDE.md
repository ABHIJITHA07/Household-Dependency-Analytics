# 27 — Antigravity Implementation Guide

Directives and operational guidelines for the AI coding agent (**Antigravity**) during execution phases.

---

## 1. Core Operating Directives

1. **Obey Specification Single Source of Truth:** `00_PROJECT_MASTER_SPEC.md` and detailed topic specs (`09`–`29`) win over any unverified code assumptions.
2. **Phase Isolation:** Execute work sequentially phase-by-phase. Do NOT start a new phase until the current phase is fully executed, tested, and verified.
3. **No Code Hallucinations:** Always inspect existing files using `view_file` before attempting edits. Never invent non-existent helper functions or import paths.

---

## 2. Phase Execution Protocol

For each implementation phase (Phases 1 through 16):
1. **Plan & Execute:** Write modular, clean code following repository patterns.
2. **Run Verification Command:** Execute build, test, or liveness check commands after completing edits.
3. **Handle Errors:** If a command fails, inspect raw output, fix the root cause, and re-test. Never delete broken unit tests or swallow runtime exceptions to fake success.
4. **Summary & Pause:** Present a clear, concise natural language summary of completed items to the user.

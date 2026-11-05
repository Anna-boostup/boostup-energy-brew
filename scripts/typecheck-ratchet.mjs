#!/usr/bin/env node
// Typecheck ratchet: fails when the app has MORE TypeScript errors than the
// recorded baseline. Existing errors don't block deploys, new ones do.
// When you fix errors, lower the number in .typecheck-baseline.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const baselineFile = new URL("../.typecheck-baseline", import.meta.url);
const baseline = Number(readFileSync(baselineFile, "utf8").trim());
if (!Number.isInteger(baseline) || baseline < 0) {
  console.error("Invalid .typecheck-baseline (expected a non-negative integer).");
  process.exit(2);
}

const res = spawnSync("npx", ["tsc", "-p", "tsconfig.app.json", "--noEmit", "--pretty", "false"], {
  encoding: "utf8",
  shell: process.platform === "win32",
});
const out = `${res.stdout || ""}${res.stderr || ""}`;
const errors = out.split("\n").filter((l) => /error TS\d+/.test(l));

if (res.status !== 0 && errors.length === 0) {
  console.error("tsc failed without reporting type errors:\n" + out);
  process.exit(2);
}

console.log(`TypeScript errors: ${errors.length} (baseline ${baseline})`);
if (errors.length > baseline) {
  console.error(`\n${errors.length - baseline} new type error(s). Fix them, the list:\n`);
  console.error(errors.join("\n"));
  process.exit(1);
}
if (errors.length < baseline) {
  console.log(`Nice: ${baseline - errors.length} fewer errors. Lower .typecheck-baseline to ${errors.length}.`);
}

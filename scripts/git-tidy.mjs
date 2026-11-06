#!/usr/bin/env node
// File-hygiene check. Runs automatically after `git pull` (post-merge hook in
// .githooks/) and at the start of every Claude session (see CLAUDE.md).
// Read-only: it never deletes or commits anything, it only reports.
//   node scripts/git-tidy.mjs          full report
//   node scripts/git-tidy.mjs --quiet  print nothing when everything is tidy
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const quiet = process.argv.includes("--quiet");
const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
const root = git("rev-parse", "--show-toplevel").trim();
const stamp = path.join(git("rev-parse", "--absolute-git-dir").trim(), "tidy-last-check");
const DAY = 86_400_000;
const now = Date.now();

function ago(ms) {
  const d = Math.floor(ms / DAY);
  if (d < 1) return "today";
  if (d < 14) return `${d} day${d === 1 ? "" : "s"}`;
  if (d < 60) return `${Math.floor(d / 7)} weeks`;
  return `${Math.floor(d / 30)} months`;
}

/** Newest modification time of a file, or of anything inside a folder. */
function newest(p) {
  try {
    const st = fs.statSync(p);
    if (!st.isDirectory()) return st.mtimeMs;
    let t = st.mtimeMs;
    for (const name of fs.readdirSync(p)) t = Math.max(t, newest(path.join(p, name)));
    return t;
  } catch {
    return now;
  }
}

let last = null;
try {
  last = Number(fs.readFileSync(stamp, "utf8"));
} catch {}

const entries = git("status", "--porcelain=v1", "-z", "--untracked-files=normal")
  .split("\0")
  .filter(Boolean);
const changed = [];
const untracked = [];
for (const e of entries) {
  const code = e.slice(0, 2);
  const file = e.slice(3);
  if (code === "??") untracked.push(file);
  else if (!/^R/.test(code)) changed.push({ code: code.trim(), file });
}

const withAge = (f) => ({ file: f, age: now - newest(path.join(root, f)) });
const changedAged = changed.map((c) => ({ ...withAge(c.file), code: c.code })).sort((a, b) => b.age - a.age);
const untrackedAged = untracked.map(withAge).sort((a, b) => b.age - a.age);
const ahead = (() => {
  try {
    return Number(git("rev-list", "--count", "@{u}..HEAD").trim());
  } catch {
    return 0;
  }
})();

fs.writeFileSync(stamp, String(now));

const tidy = !changedAged.length && !untrackedAged.length && !ahead;
if (tidy && quiet) process.exit(0);

const repo = path.basename(root);
const lines = [];
const lastText = !last ? "first check" : now - last < DAY ? "last check earlier today" : `last check ${ago(now - last)} ago`;
lines.push(`\n── Tidy check: ${repo} (${lastText}) ──`);
if (tidy) {
  lines.push("All tidy: nothing uncommitted, nothing untracked, nothing waiting to push.");
} else {
  if (ahead) lines.push(`• ${ahead} commit${ahead === 1 ? "" : "s"} not pushed yet. Run: git push`);
  if (changedAged.length) {
    lines.push(`• Edited but not committed (${changedAged.length}):`);
    for (const c of changedAged.slice(0, 15)) lines.push(`    ${c.code === "D" ? "deleted " : ""}${c.file}  (changed ${ago(c.age)}${c.age >= DAY ? " ago" : ""})`);
    if (changedAged.length > 15) lines.push(`    …and ${changedAged.length - 15} more`);
    lines.push("  Keep them: git add <file> then git commit. Throw away edits: git restore <file>");
  }
  if (untrackedAged.length) {
    const stale = untrackedAged.filter((u) => u.age >= 30 * DAY);
    const old = untrackedAged.filter((u) => u.age >= 7 * DAY && u.age < 30 * DAY);
    const fresh = untrackedAged.filter((u) => u.age < 7 * DAY);
    lines.push(`• Not in git at all (${untrackedAged.length}):`);
    const show = (label, list) => {
      if (!list.length) return;
      lines.push(`    ${label}`);
      for (const u of list.slice(0, 10)) lines.push(`      ${u.file}  (${u.age < DAY ? "new today" : `${ago(u.age)} old`})`);
      if (list.length > 10) lines.push(`      …and ${list.length - 10} more`);
    };
    show("Sitting 30+ days, probably commit it or delete it:", stale);
    show("Sitting 1 to 4 weeks:", old);
    show("New this week:", fresh);
    lines.push("  Keep: git add <file> + commit. Private/never share: add it to .gitignore. Junk: delete it.");
    lines.push("  Nothing is deleted automatically.");
  }
}
console.log(lines.join("\n") + "\n");

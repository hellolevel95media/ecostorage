// Loads content/articles/queue/*.md into the database as scheduled drafts and
// uploads their images. The daily cron (/api/cron/publish-articles) publishes
// one due draft per day.
//
//   node scripts/seed-article-queue.mjs --start 2026-11-09            (dry run)
//   node scripts/seed-article-queue.mjs --start 2026-11-09 --apply    (writes)
// Optional: --every 2 (days between articles, default 1) and --at 08:50
// (UTC time of day, default 00:30). The publish cron runs at 09:00 UTC, so use
// a time shortly before it.
//
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (or
// SUPABASE_SERVICE_ROLE_KEY) in .env.local. Secrets are never printed.
// Existing slugs are skipped, so the script is safe to re-run.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const queueDir = join(root, "content", "articles", "queue");
const imageDir = join(root, "content", "articles", "images");

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const startIdx = args.indexOf("--start");
const start = startIdx >= 0 ? args[startIdx + 1] : null;
const argVal = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const every = Number(argVal("--every", "1"));
const at = argVal("--at", "00:30");
if (!Number.isInteger(every) || every < 1 || !/^\d{2}:\d{2}$/.test(at)) {
  console.error("--every must be a whole number of days and --at must look like 08:50");
  process.exit(1);
}
if (!start || !/^\d{4}-\d{2}-\d{2}$/.test(start)) {
  console.error("Usage: node scripts/seed-article-queue.mjs --start YYYY-MM-DD [--apply]");
  process.exit(1);
}

function loadEnv() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv();

function parseArticle(file) {
  const text = readFileSync(join(queueDir, file), "utf8").replace(/\r\n/g, "\n");
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing header`);
  const meta = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  for (const key of ["title", "slug", "category", "tags", "excerpt", "image", "image_alt"]) {
    if (!meta[key]) throw new Error(`${file}: header is missing "${key}"`);
  }
  const tags = meta.tags.replace(/^\[|\]$/g, "").split(",").map((t) => t.trim()).filter(Boolean);
  const body = m[2].trim();
  if (/^#{3,} |^\d+\. /m.test(body)) throw new Error(`${file}: body uses unsupported ### headings or numbered lists`);
  if (meta.excerpt.length > 160) throw new Error(`${file}: excerpt is over 160 characters`);
  return { file, ...meta, tags, body };
}

const files = readdirSync(queueDir).filter((f) => /^\d\d-.*\.md$/.test(f)).sort();
const articles = files.map(parseArticle);

// Publish times are UTC, shortly before the 09:00 UTC (17:00 Singapore) cron run.
function dateFor(i) {
  const d = new Date(`${start}T${at}:00Z`);
  d.setUTCDate(d.getUTCDate() + i * every);
  return d.toISOString();
}

for (const a of articles) {
  const img = join(imageDir, a.image);
  if (!existsSync(img)) throw new Error(`${a.file}: image ${a.image} not found`);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or the service key in .env.local");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: existing, error: existingError } = await supabase.from("articles").select("slug");
if (existingError) throw existingError;
const taken = new Set((existing ?? []).map((r) => r.slug));

console.log(apply ? "APPLY" : "DRY RUN (nothing is written)");
let count = 0;
for (const [i, a] of articles.entries()) {
  const when = dateFor(i);
  if (taken.has(a.slug)) {
    console.log(`skip  ${a.slug} (already exists)`);
    continue;
  }
  const words = a.body.split(/\s+/).length;
  console.log(`${when.slice(0, 10)}  ${a.slug}  [${a.category}]  ${words} words  ${a.image}`);
  count++;
  if (!apply) continue;

  const imgPath = join(imageDir, a.image);
  const fileData = readFileSync(imgPath);
  const storagePath = `${Date.now()}-${a.image.replace(/^\d\d-/, "")}`;
  const { error: upErr } = await supabase.storage
    .from("media")
    .upload(storagePath, fileData, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
  if (upErr) throw new Error(`${a.slug}: image upload failed: ${upErr.message}`);

  const { error: mediaErr } = await supabase.from("media_assets").insert({
    file_name: a.image.replace(/^\d\d-/, ""),
    file_path: storagePath,
    file_type: "image/webp",
    file_size: statSync(imgPath).size,
    alt_text: a.image_alt,
  });
  if (mediaErr) throw new Error(`${a.slug}: media_assets insert failed: ${mediaErr.message}`);

  const { data: pub } = supabase.storage.from("media").getPublicUrl(storagePath);
  const { error: insErr } = await supabase.from("articles").insert({
    slug: a.slug,
    title: a.title,
    category: a.category,
    tags: a.tags,
    thumbnail_url: pub.publicUrl,
    excerpt: a.excerpt,
    body: a.body,
    status: "draft",
    locale: "en",
    author: "EcoStorage Team",
    published_at: when,
  });
  if (insErr) throw new Error(`${a.slug}: article insert failed: ${insErr.message}`);
}
console.log(`${apply ? "Added" : "Would add"} ${count} article(s).`);

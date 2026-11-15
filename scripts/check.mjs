// Checks what the JSON schemas cannot: file names, that every image exists and really is an image, that categories
// exist, and the publish rule. Run: node scripts/check.mjs   (the site runs the same checks when it syncs, and keeps
// the last good version of a file that does not pass; the reasons are at https://audio.ztraqto.com/v1/catalog/status)
import { existsSync, readdirSync, readFileSync } from "node:fs";

const errors = [];
const fail = (path, message) => errors.push(`${path}: ${message}`);
const read = (path) => {
  try { return JSON.parse(readFileSync(path, "utf8").replace(/^﻿/, "")); } catch (error) { fail(path, `JSON の書き方が正しくありません: ${error.message}`); return null; }
};
const IMAGE_HOSTS = ["raw.githubusercontent.com", "cdn.jsdelivr.net", "booth.pximg.net"];
const LINK_HOSTS = ["booth.pm", ".booth.pm", "ztraqto.com", ".ztraqto.com"];

function sniff(bytes) {
  const ascii = (from, text) => [...text].every((ch, i) => bytes[from + i] === ch.charCodeAt(0));
  if (bytes[0] === 0x89 && ascii(1, "PNG\r\n\u001a\n")) return true;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true;
  if (ascii(0, "GIF87a") || ascii(0, "GIF89a")) return true;
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return true;
  return ascii(4, "ftypavif") || ascii(4, "ftypavis");
}

function image(file, field, value) {
  if (value === undefined || value === null || value === "") return;
  if (typeof value !== "string") return fail(file, `${field} は文字列にしてください。`);
  const path = value.replace(/^\.?\//, "");
  if (path.startsWith("images/")) {
    if (path.includes("..") || !/^images\/[A-Za-z0-9._/-]+\.(png|jpe?g|webp|avif|gif)$/.test(path)) return fail(file, `${field}: ${path} は使えないファイル名です。`);
    if (!existsSync(path)) return fail(file, `${field}: ${path} がありません（大文字・小文字も確認）。`);
    if (!sniff(readFileSync(path))) return fail(file, `${field}: ${path} は PNG・JPEG・WebP・AVIF・GIF の画像ではありません。`);
    return;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !IMAGE_HOSTS.includes(url.hostname)) fail(file, `${field}: 画像は images/ のファイルか ${IMAGE_HOSTS.join("、")} の https URL にしてください。`);
  } catch { fail(file, `${field}: images/ から始まるパスか https URL にしてください。`); }
}

function link(file, field, value) {
  if (!value) return;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || !LINK_HOSTS.some((h) => h.startsWith(".") ? host.endsWith(h) : host === h)) fail(file, `${field}: 使えるリンク先は ${LINK_HOSTS.join("、")} です。`);
  } catch { fail(file, `${field}: URL の形式が正しくありません。`); }
}

const categories = existsSync("categories.json") ? read("categories.json") : { categories: [] };
const categorySlugs = new Set((categories?.categories ?? []).map((c) => c.slug));
if (existsSync("site.json")) read("site.json");

const files = existsSync("products") ? readdirSync("products") : [];
for (const name of files) {
  const file = `products/${name}`;
  if (!name.endsWith(".json")) { fail(file, "products/ には .json だけを置いてください。"); continue; }
  if (!/^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?\.json$/.test(name)) { fail(file, "ファイル名は英小文字・数字・ハイフンにしてください（これがページのURLになります）。"); continue; }
  const p = read(file);
  if (!p) continue;
  if (p.category && !categorySlugs.has(p.category)) fail(file, `category "${p.category}" は categories.json にありません。`);
  image(file, "hero", p.hero);
  image(file, "icon", p.icon);
  (p.sections ?? []).forEach((s, i) => {
    image(file, `sections[${i}].image`, s.image);
    (s.images ?? []).forEach((img, j) => image(file, `sections[${i}].images[${j}]`, img));
  });
  for (const field of ["buyUrl", "demoUrl", "manualUrl"]) link(file, field, p[field]);
  if (p.sale?.price !== undefined && (p.price === undefined || p.price === null || p.sale.price >= p.price)) fail(file, "sale.price は通常価格（price）より安くしてください。");
  if ((p.status ?? "published") === "published" && !p.buyUrl && !(p.tags ?? []).map((t) => String(t).toUpperCase()).includes("COMING_SOON")) {
    fail(file, '公開するには buyUrl（Booth）を入れるか、tags に "COMING_SOON" を付けてください。');
  }
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log(`✓ ${files.length} 個の製品、${categorySlugs.size} 個のカテゴリに問題はありません。`);

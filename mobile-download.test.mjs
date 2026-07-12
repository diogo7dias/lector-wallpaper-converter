import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");

test("mobile layout keeps tabs, controls, and cards usable on narrow screens", () => {
  assert.match(html, /@media \(max-width:700px\)\{[\s\S]*?\.tabs\{display:flex;width:100%/);
  assert.match(html, /@media \(max-width:700px\)\{[\s\S]*?\.tab\{flex:1;padding:12px 6px/);
  assert.match(html, /@media \(max-width:700px\)\{[\s\S]*?\.controls\{grid-template-columns:1fr/);
  assert.match(html, /@media \(max-width:700px\)\{[\s\S]*?\.seg button\{min-height:44px/);
  assert.match(html, /@media \(max-width:700px\)\{[\s\S]*?\.results,\.ggrid\{grid-template-columns:minmax\(0,1fr\)/);
});

test("converted downloads expose a retro themed progress bar", () => {
  assert.match(html, /id="downloadProgress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"/);
  assert.match(html, /\.download-progress-track\{[\s\S]*?repeating-linear-gradient/);
  assert.match(html, /\.download-progress-fill\{[\s\S]*?steps\(6,end\)/);
  assert.match(html, /function showDownloadProgress\(done,total,label\)/);
  assert.match(html, /showDownloadProgress\(i\+1,downloadable\.length/);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");

test("theme toggle has persistent, accessible light and dark behavior", () => {
  assert.match(html, /id="themeToggle"/);
  assert.match(html, /aria-label="Switch to dark mode"/);
  assert.match(html, /data-theme="dark"/);
  assert.match(html, /localStorage\.setItem\("lector-theme"/);
  assert.match(html, /matchMedia\("\(prefers-color-scheme: dark\)"\)/);
});

test("dark theme action red meets AA contrast against white text", () => {
  const red = html.match(/:root\[data-theme="dark"\][\s\S]*?--red:#([0-9a-f]{6})/i)?.[1];
  assert.ok(red, "dark theme red token is present");
  const rgb = red.match(/../g).map(part => Number.parseInt(part, 16) / 255);
  const linear = rgb.map(channel => channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  const contrast = 1.05 / (luminance + 0.05);
  assert.ok(contrast >= 4.5, `contrast was ${contrast.toFixed(2)}:1`);
});

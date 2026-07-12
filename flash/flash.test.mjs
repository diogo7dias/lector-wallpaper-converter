import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
const readJson = (p) => JSON.parse(read(p));

const html = read("./index.html");
const update = readJson("./manifest-update.json");
const full = readJson("./manifest-full.json");

// Flash offsets are dictated by the device partition table (partitions.csv in the
// lector repo). If these change, the firmware will not boot — treat them as fixed.
const OFFSET = { bootloader: 0, partitions: 0x8000, boot_app0: 0xe000, app: 0x10000 };

test("update manifest flashes only the app image, no erase", () => {
  assert.equal(update.new_install_prompt_erase, false);
  assert.equal(update.builds.length, 1);
  assert.equal(update.builds[0].chipFamily, "ESP32-C3");
  const parts = update.builds[0].parts;
  assert.equal(parts.length, 1, "update writes exactly one part");
  assert.equal(parts[0].path, "firmware/latest/firmware.bin");
  assert.equal(parts[0].offset, OFFSET.app);
  assert.equal(parts[0].offset, 65536);
});

test("full manifest flashes all four parts at the correct offsets, erase first", () => {
  assert.equal(full.new_install_prompt_erase, true);
  assert.equal(full.builds.length, 1);
  assert.equal(full.builds[0].chipFamily, "ESP32-C3");
  const parts = full.builds[0].parts;
  assert.equal(parts.length, 4, "full writes bootloader + partitions + boot_app0 + app");
  const byPath = Object.fromEntries(parts.map((p) => [p.path, p.offset]));
  assert.equal(byPath["firmware/latest/bootloader.bin"], OFFSET.bootloader);
  assert.equal(byPath["firmware/latest/partitions.bin"], OFFSET.partitions);
  assert.equal(byPath["firmware/latest/boot_app0.bin"], OFFSET.boot_app0);
  assert.equal(byPath["firmware/latest/firmware.bin"], OFFSET.app);
  // Exact decimal offsets, guarding against a silent hex/dec mistake.
  assert.deepEqual(
    parts.map((p) => p.offset).sort((a, b) => a - b),
    [0, 32768, 57344, 65536],
  );
});

test("page loads the flasher engine and both manifests", () => {
  assert.match(html, /esp-web-tools@10\/dist\/web\/install-button\.js/);
  assert.match(html, /manifest="manifest-update\.json"/);
  assert.match(html, /manifest="manifest-full\.json"/);
});

test("page reads the published version and warns when rescue files are absent", () => {
  assert.match(html, /fetch\("version\.txt"/);
  assert.match(html, /fetch\("firmware\/latest\/bootloader\.bin",\{method:"HEAD"\}\)/);
});

test("version.txt is a plain semantic version", () => {
  const v = read("./version.txt").trim();
  assert.match(v, /^\d+\.\d+\.\d+$/);
});

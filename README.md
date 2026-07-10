# Lector Wallpaper Converter

A single-page, in-browser tool that converts any image into a sleep wallpaper for the
[Lector / CrossPoint](https://github.com/diogo7dias/lector) e-ink reader — as a device-ready
**`.pxc`** (packed 2-bit) or **`.bmp`** (2-bit grayscale) file.

**→ Live tool: https://diogo7dias.github.io/lector-wallpaper-converter/**

Everything runs locally in the browser via an HTML canvas. No image is ever uploaded.

## Use

1. Pick your **screen** — `X4 · 480×800` (the standard build) or `X3 · 528×792`.
2. Pick the **format** — `PXC` or `BMP`.
3. Drop in one or more images. The best rendering settings are detected per image.
4. Download, copy the files into `/sleep` on the SD card.
5. On the device: **Settings → Sleep Screen = Custom**, and **Wallpaper Format** = whatever you exported.

Files must match the screen size within 1&nbsp;px or the device rejects them — that is why the
screen selector matters.

## What "auto" does

- **Rendering** — measures the image's tonal range. Photographs (many tones) get Floyd–Steinberg
  dithering for smooth gradients; logos / line art / text (few tones) get crisp thresholding.
- **Auto-contrast** — stretches tones across all four gray levels so flat images aren't muddy.
- **Fit** — *Cover* fills and crops (default), *Fit* letterboxes, *Stretch* distorts.
- **Invert** — only if a wallpaper renders like a photo negative on your panel.

## Format notes

`.pxc`: 4-byte little-endian `width,height` header, then 2 bits/pixel (levels 0–3 = gray
0/85/170/255), MSB-first, row stride `(width+3)/4`. `.bmp`: standard bottom-up 2-bit bitmap with a
4-entry grayscale palette. Both match the device decoder (`PxcSleepRenderer.cpp` / `Bitmap.cpp`)
byte-for-byte.

## Gallery

The **Gallery** tab shares 3,190 ready-made wallpapers stored as sequentially named `.pxc` files in
[`gallery/`](gallery/). Original X3 (528×792) and X4 (480×800) bytes are preserved exactly. The page
shows one 24-preview page at a time to keep memory and network use bounded, offers each original master as-is,
and re-targets to the other screen or to `.bmp` locally on demand.

Run `node scripts/import-gallery.mjs ~/Downloads` to rebuild the gallery from a folder tree. The importer
finds `.pxc` files recursively, validates X3/X4 dimensions, removes exact byte duplicates from the import,
sorts deterministically, copies masters as `0001.pxc` onward, and regenerates the manifest. It reports
source duplicates but never deletes source files.

The gallery loads over http (the live site or a local server); the Converter tab still works fully
offline.

Offline-capable: save the page and it still works with no network.

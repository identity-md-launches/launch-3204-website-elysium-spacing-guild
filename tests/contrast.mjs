// Measure the rendered evidence produced by tests/browser.mjs. Requires optional Sharp.
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const sharp = require(process.env.IMD_SHARP ? resolve(process.env.IMD_SHARP) : 'sharp');
const luminance = (rgb) => rgb.map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
const raw = (path) => sharp(path).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const report = [];
for (const size of ['390x844', '1440x900', '390x844-closer', '1440x900-closer', '320x720-text-200', '390x844-text-200']) {
  const stem = `test/scratch/browser-validation/chromium/${size}`;
  const meta = JSON.parse(await readFile(stem + '-contrast.json'));
  const bg = await raw(stem + '-background.png');
  const mask = await raw(stem + '-mask.png');
  let min = Infinity;
  let count = 0;
  for (let i = 0; i < mask.data.length; i += mask.info.channels) {
    if (mask.data[i] >= 250 && mask.data[i + 1] >= 250 && mask.data[i + 2] >= 250) {
      count++;
      min = Math.min(min, contrast(meta.colors.text, [...bg.data.subarray(i, i + 3)]));
    }
  }
  if (!count) throw new Error('No glyph pixels: ' + size);
  const result = { viewport: size, textRgb: meta.colors.text, minimumTextContrast: min, glyphPixels: count, iconContrast: contrast(meta.colors.icon, meta.colors.button) };
  if (size === '390x844' || size === '1440x900') {
    const focus = await raw(stem + '-focus.png');
    const behind = await raw(stem + '-focus-background.png');
    const box = meta.control;
    const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    let focusMin = Infinity;
    let focusPixels = 0;
    for (let y = Math.floor(box.y - 7); y < box.y + box.height + 7; y++) {
      for (let x = Math.floor(box.x - 7); x < box.x + box.width + 7; x++) {
        const radius = Math.hypot(x + 0.5 - center.x, y + 0.5 - center.y);
        if (radius < box.width / 2 - 7 || radius > box.width / 2 - 2) continue;
        const i = (y * focus.info.width + x) * focus.info.channels;
        if (meta.colors.focus.every((value, c) => Math.abs(value - focus.data[i + c]) < 4)) {
          focusPixels++;
          focusMin = Math.min(focusMin, contrast(meta.colors.focus, [...behind.data.subarray(i, i + 3)]));
        }
      }
    }
    if (!focusPixels) throw new Error('No focus pixels: ' + size);
    result.minimumFocusContrast = focusMin;
    result.focusPixels = focusPixels;
  }
  report.push(result);
}
await writeFile('test/scratch/contrast-results.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.some(result => result.minimumTextContrast < 3 || result.iconContrast < 3 || (result.minimumFocusContrast !== undefined && result.minimumFocusContrast < 3))) process.exitCode = 1;

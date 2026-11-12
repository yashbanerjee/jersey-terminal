import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "../apps/web/public/squad/united-tigers");
const files = fs.readdirSync(dir).filter((f) => /\.jpe?g$/i.test(f));

function isBg(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max - min;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // Studio grey + soft floor spill — low saturation, mid/high luminance
  return sat < 36 && lum > 55 && lum < 245;
}

async function processFile(file) {
  const filePath = path.join(dir, file);
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const queue = [];

  const push = (x, y) => {
    const i = y * width + x;
    if (visited[i]) return;
    const o = i * channels;
    if (!isBg(data[o], data[o + 1], data[o + 2])) return;
    visited[i] = 1;
    queue.push(i);
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  while (queue.length) {
    const i = queue.pop();
    const x = i % width;
    const y = (i / width) | 0;
    const o = i * channels;
    data[o] = 0;
    data[o + 1] = 0;
    data[o + 2] = 0;
    data[o + 3] = 255;
    if (x > 0) push(x - 1, y);
    if (x + 1 < width) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y + 1 < height) push(x, y + 1);
  }

  // Also clear enclosed grey pockets (e.g. between legs) that edge flood misses.
  for (let i = 0; i < width * height; i++) {
    if (visited[i]) continue;
    const o = i * channels;
    if (!isBg(data[o], data[o + 1], data[o + 2])) continue;
    visited[i] = 1;
    data[o] = 0;
    data[o + 1] = 0;
    data[o + 2] = 0;
    data[o + 3] = 255;
  }

  // Soft fringe toward black so cut edges match product mockups
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      if (visited[i]) continue;
      let near = false;
      for (const [dx, dy] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        if (visited[(y + dy) * width + (x + dx)]) {
          near = true;
          break;
        }
      }
      if (!near) continue;
      const o = i * channels;
      const r = data[o];
      const g = data[o + 1];
      const b = data[o + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max - min;
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (sat < 40 && lum > 70) {
        const t = Math.min(1, (lum - 70) / 90);
        data[o] = (r * (1 - t * 0.85)) | 0;
        data[o + 1] = (g * (1 - t * 0.85)) | 0;
        data[o + 2] = (b * (1 - t * 0.85)) | 0;
      }
    }
  }

  const tmp = `${filePath}.tmp.jpg`;
  await sharp(data, { raw: { width, height, channels } }).jpeg({ quality: 90, mozjpeg: true }).toFile(tmp);
  fs.renameSync(tmp, filePath);
  const keyed = visited.reduce((a, v) => a + v, 0);
  console.log(
    file,
    `${width}x${height}`,
    "keyed",
    keyed,
    `(${((keyed / (width * height)) * 100).toFixed(1)}%)`,
  );
}

for (const f of files) {
  await processFile(f);
}
console.log("done", files.length);

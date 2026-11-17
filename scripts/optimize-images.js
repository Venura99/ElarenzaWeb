/**
 * Pre-renders the images we ship in public/images to WebP at the handful of
 * widths they are actually displayed at.
 *
 * These files are served straight from the CDN with no resizing step in front
 * of them, so whatever is on disk is what the customer downloads. The
 * originals are far larger than any slot they appear in — the header logo is
 * a 1536x1024 PNG rendered at 40px.
 *
 * Output is committed, so a deploy never depends on this having been re-run.
 * Re-run with `node scripts/optimize-images.js` after changing a source image,
 * and keep the widths in step with LOCAL_VARIANTS in src/lib/image-loader.ts.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const IMAGES = path.join(ROOT, "public", "images");
const OUT = path.join(IMAGES, "optimized");

const SOURCES = [
  { file: "home-image.png", widths: [640, 960, 1280, 1920], quality: 72 },
  { file: "logo.png", widths: [64, 128, 256], quality: 82 },
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  let originalTotal = 0;
  let outputTotal = 0;

  for (const { file, widths, quality } of SOURCES) {
    const source = path.join(IMAGES, file);
    if (!fs.existsSync(source)) {
      console.warn(`skipped ${file} (not found)`);
      continue;
    }

    const originalBytes = fs.statSync(source).size;
    originalTotal += originalBytes;
    const base = file.replace(/\.[^.]+$/, "");

    for (const width of widths) {
      const target = path.join(OUT, `${base}-${width}.webp`);
      await sharp(source)
        .resize(width, null, { withoutEnlargement: true })
        .webp({ quality })
        .toFile(target);

      const bytes = fs.statSync(target).size;
      outputTotal += bytes;
      console.log(
        `${base}-${width}.webp  ${kb(bytes)}  (from ${kb(originalBytes)} original)`
      );
    }
  }

  console.log(
    `\nAll variants: ${kb(outputTotal)} total, replacing ${kb(originalTotal)} of originals.`
  );
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(0)}KB`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

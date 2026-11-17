/**
 * Builds the browser tab icon and the iOS home-screen icon from the full logo.
 *
 * The full logo is a circular badge with the ELARENZA wordmark under the
 * monogram. At the ~16px a browser tab actually renders, that wordmark turns
 * into an unreadable smudge, so this crops to the gold "E" monogram alone,
 * sets it inside the brand's gold ring, and feathers the crop edge so it
 * blends into the cream field rather than showing a square seam.
 *
 * Re-run with `node scripts/generate-icons.js` if the logo is ever replaced.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const SOURCE = path.join(ROOT, "public", "images", "logo.png");
const APP_DIR = path.join(ROOT, "src", "app");

// The monogram's bounding box inside the 1536x1024 logo, chosen to clear the
// badge's outer ring at the top and the wordmark at the bottom.
const CROP = { left: 500, top: 55, width: 525, height: 525 };

const SIZE = 512; // master size; everything else is downscaled from this
const INNER = 430; // monogram size within the master, leaving a cream margin
const CREAM = "#f8f4ed";

const ring = Buffer.from(
  `<svg width="${SIZE}" height="${SIZE}">
     <circle cx="256" cy="256" r="243" fill="none" stroke="#c6a15b" stroke-width="18"/>
     <circle cx="256" cy="256" r="226" fill="none" stroke="#e8d6a8" stroke-width="5"/>
   </svg>`
);

const badgeMask = Buffer.from(
  `<svg width="${SIZE}" height="${SIZE}"><circle cx="256" cy="256" r="254" fill="#fff"/></svg>`
);

// Softened so the square crop fades out instead of leaving a visible edge
// against the cream canvas.
const monogramMask = Buffer.from(
  `<svg width="${INNER}" height="${INNER}">
     <circle cx="${INNER / 2}" cy="${INNER / 2}" r="${INNER / 2 - 4}" fill="#fff"/>
   </svg>`
);

function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  const entries = [];
  let offset = 6 + 16 * images.length;

  for (const { size, buf } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // palette colours
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buf.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += buf.length;
    entries.push(entry);
  }

  return Buffer.concat([header, ...entries, ...images.map((i) => i.buf)]);
}

async function main() {
  if (!fs.existsSync(SOURCE)) {
    throw new Error(`Logo not found at ${SOURCE}`);
  }

  const monogram = await sharp(SOURCE)
    .extract(CROP)
    .resize(INNER, INNER)
    .composite([{ input: monogramMask, blend: "dest-in" }])
    .blur(0.3)
    .png()
    .toBuffer();

  const inset = Math.round((SIZE - INNER) / 2);

  const master = await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: CREAM },
  })
    .composite([
      { input: monogram, left: inset, top: inset },
      { input: ring },
      { input: badgeMask, blend: "dest-in" },
    ])
    .png()
    .toBuffer();

  // At tab size the generous margin wastes most of the 16 pixels available, so
  // the .ico is built from a tighter version where the monogram fills the disc.
  const compactInner = 480;
  const compactMonogram = await sharp(SOURCE)
    .extract(CROP)
    .resize(compactInner, compactInner)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${compactInner}" height="${compactInner}">
             <circle cx="${compactInner / 2}" cy="${compactInner / 2}" r="${compactInner / 2 - 4}" fill="#fff"/>
           </svg>`
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  const compact = await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: CREAM },
  })
    .composite([
      { input: compactMonogram, left: 16, top: 16 },
      {
        input: Buffer.from(
          `<svg width="${SIZE}" height="${SIZE}">
             <circle cx="256" cy="256" r="248" fill="none" stroke="#c6a15b" stroke-width="14"/>
           </svg>`
        ),
      },
      { input: badgeMask, blend: "dest-in" },
    ])
    .png()
    .toBuffer();

  // 256px is plenty for a tab/bookmark icon, and the palette keeps it small
  // enough that it costs nothing to fetch.
  await sharp(master)
    .resize(256, 256)
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(APP_DIR, "icon.png"));

  // iOS crops a transparent icon badly, so this one keeps a solid cream field.
  await sharp(master)
    .resize(180, 180)
    .flatten({ background: CREAM })
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(APP_DIR, "apple-icon.png"));

  const icoSizes = [16, 32, 48];
  const icoImages = await Promise.all(
    icoSizes.map(async (size) => ({
      size,
      buf: await sharp(compact).resize(size, size).png({ compressionLevel: 9 }).toBuffer(),
    }))
  );
  fs.writeFileSync(path.join(APP_DIR, "favicon.ico"), buildIco(icoImages));

  console.log("Wrote src/app/icon.png, src/app/apple-icon.png, src/app/favicon.ico");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

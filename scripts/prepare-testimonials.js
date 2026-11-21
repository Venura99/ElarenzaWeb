/**
 * Turns the raw WhatsApp screenshots into copies that are safe to publish.
 *
 * The originals carry, in the header bar of every screenshot: the customer's
 * saved name or phone number, their profile photograph, and their last-seen or
 * online status. The hand redaction already on them is not enough — the black
 * bars cover the middle of a number while leaving "+94" and the trailing
 * digits readable, and many profile photographs are untouched.
 *
 * Rather than trying to detect and paint over each piece, this crops the
 * header off entirely. It is deterministic, it cannot partially miss, and it
 * removes nothing of value: no feedback text lives in that bar. The input row
 * at the foot goes too, since it only ever shows a keyboard and a draft.
 *
 * What this CANNOT do is read the conversation. Addresses on a shipping label,
 * a phone number typed into a message, a face in a shared photo — those are
 * inside the message area and have to be reviewed by eye. The script writes a
 * contact sheet for exactly that purpose, and every image must be approved
 * before it is listed in src/lib/testimonials.ts.
 *
 * Originals stay in "customer feedback screenshots", which is gitignored.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const SOURCE = path.join(ROOT, "customer feedback screenshots");
const OUT = path.join(ROOT, "public", "images", "testimonials");
const REVIEW = path.join(ROOT, "testimonial-review");

// Fractions of image height. Measured against the 740x1600 captures: the
// status bar and chat header together end just before 12%, and the input row
// occupies the last 9%. Generous on purpose — overlap costs nothing.
const HEADER_FRACTION = 0.125;
const FOOTER_FRACTION = 0.09;

const WIDTH = 620; // enough for a lightbox on a desktop display
const QUALITY = 80;

/**
 * Numbers withheld after review — mobile numbers, names, waybills, legible
 * shipping labels, a customer's own photograph. Anything written into
 * public/ is served whether or not a page links to it, so these must never
 * be produced at all: without this list, re-running the script would quietly
 * republish every one of them. Reasons live in src/lib/testimonials.ts, which
 * must be kept in step with this.
 */
const WITHHELD = new Set([
  8, 10, 11, 12, 13, 14, 17, 18, 22, 23, 25, 27, 29, 30, 34, 35, 36, 37, 43, 47,
]);

async function main() {
  if (!fs.existsSync(SOURCE)) throw new Error(`Missing ${SOURCE}`);
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(REVIEW, { recursive: true });

  const files = fs
    .readdirSync(SOURCE)
    .filter((f) => /\.(jpe?g|png)$/i.test(f))
    .sort();

  const results = [];

  let withheld = 0;

  for (let i = 0; i < files.length; i++) {
    if (WITHHELD.has(i + 1)) {
      withheld++;
      continue;
    }

    const source = path.join(SOURCE, files[i]);
    const meta = await sharp(source).metadata();

    const top = Math.round(meta.height * HEADER_FRACTION);
    const bottom = Math.round(meta.height * FOOTER_FRACTION);
    const height = meta.height - top - bottom;

    const id = `testimonial-${String(i + 1).padStart(2, "0")}`;
    const outFile = path.join(OUT, `${id}.webp`);

    const info = await sharp(source)
      .extract({ left: 0, top, width: meta.width, height })
      .resize(WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outFile);

    results.push({ id, file: `${id}.webp`, from: files[i], width: info.width, height: info.height, bytes: info.size });
  }

  // Contact sheet so the cropped set can be checked by eye in one pass.
  const COLS = 6;
  const TW = 300;
  const TH = 520;
  const tiles = [];
  for (let i = 0; i < results.length; i++) {
    const buf = await sharp(path.join(OUT, results[i].file))
      .resize(TW - 10, TH - 30, { fit: "contain", background: "#111" })
      .png()
      .toBuffer();
    tiles.push({ input: buf, left: (i % COLS) * TW + 5, top: Math.floor(i / COLS) * TH + 25 });
  }
  const rows = Math.ceil(results.length / COLS);
  await sharp({
    create: { width: COLS * TW, height: rows * TH, channels: 3, background: "#111" },
  })
    .composite(tiles)
    .jpeg({ quality: 82 })
    .toFile(path.join(REVIEW, "contact-sheet.jpg"));

  const totalKb = results.reduce((sum, r) => sum + r.bytes, 0) / 1024;
  console.log(`${results.length} cropped -> public/images/testimonials (${totalKb.toFixed(0)}KB total)`);
  console.log(`${withheld} withheld as unsafe to publish`);
  console.log(`average ${(totalKb / results.length).toFixed(0)}KB, ${results[0].width}x${results[0].height}`);
  console.log(`review sheet: testimonial-review/contact-sheet.jpg`);

  fs.writeFileSync(
    path.join(REVIEW, "manifest.json"),
    JSON.stringify(results, null, 2)
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

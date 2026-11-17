/**
 * Builds the link preview card shown when elarenza.lk is shared — most often
 * in WhatsApp, which is where most of this shop's traffic comes from.
 *
 * Without src/app/opengraph-image.png, a shared link renders as a bare grey
 * row with no image at all. This composes the hero photograph, the monogram
 * badge and the wordmark into the 1200x630 card that WhatsApp, Facebook,
 * LinkedIn and X all expect.
 *
 * Re-run with `node scripts/generate-og-image.js` after changing the hero or
 * the logo. Output is committed so deploys never depend on it.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const HERO = path.join(ROOT, "public", "images", "home-image.png");
const BADGE = path.join(ROOT, "src", "app", "icon.png");
const APP_DIR = path.join(ROOT, "src", "app");

const W = 1200;
const H = 630;

const INK = "#1c1613";
const GOLD = "#c6a15b";
const GOLD_LIGHT = "#e3c98f";
const CREAM = "#f6f1e8";

const overlay = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
     <defs>
       <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0">
         <stop offset="0%"   stop-color="${INK}" stop-opacity="0.97"/>
         <stop offset="55%"  stop-color="${INK}" stop-opacity="0.88"/>
         <stop offset="100%" stop-color="${INK}" stop-opacity="0.35"/>
       </linearGradient>
     </defs>
     <rect width="${W}" height="${H}" fill="url(#shade)"/>
     <rect x="0" y="0" width="${W}" height="6" fill="${GOLD}"/>
     <rect x="0" y="${H - 6}" width="${W}" height="6" fill="${GOLD}"/>

     <text x="235" y="150" font-family="Georgia, 'Times New Roman', serif"
           font-size="82" fill="${CREAM}" letter-spacing="10">ELARENZA</text>
     <text x="240" y="196" font-family="Helvetica, Arial, sans-serif"
           font-size="23" fill="${GOLD}" letter-spacing="11">YOUR SIGNATURE SCENT</text>

     <text x="90" y="330" font-family="Georgia, 'Times New Roman', serif"
           font-size="56" fill="${GOLD_LIGHT}">Premium Perfume Decants</text>
     <text x="90" y="400" font-family="Georgia, 'Times New Roman', serif"
           font-size="56" fill="${CREAM}">&amp; Full Bottles</text>

     <rect x="90" y="447" width="86" height="3" fill="${GOLD}"/>

     <text x="90" y="505" font-family="Helvetica, Arial, sans-serif"
           font-size="30" fill="${CREAM}" opacity="0.85">Islandwide delivery across Sri Lanka</text>
     <text x="90" y="556" font-family="Helvetica, Arial, sans-serif"
           font-size="27" fill="${GOLD}" letter-spacing="2">elarenza.lk</text>
   </svg>`
);

async function main() {
  for (const file of [HERO, BADGE]) {
    if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
  }

  const badge = await sharp(BADGE).resize(120, 120).png().toBuffer();

  const card = await sharp(HERO)
    .resize(W, H, { fit: "cover", position: "right" })
    .composite([{ input: overlay }, { input: badge, left: 90, top: 58 }])
    // JPEG rather than PNG: WhatsApp silently drops the preview on oversized
    // images, and this card is a photograph, which PNG stores badly.
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();

  // Next serves these by file convention; twitter-image keeps X from falling
  // back to no image when it ignores the og tag.
  for (const name of ["opengraph-image.jpg", "twitter-image.jpg"]) {
    fs.writeFileSync(path.join(APP_DIR, name), card);
    console.log(`${name}  ${(card.length / 1024).toFixed(0)}KB  ${W}x${H}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

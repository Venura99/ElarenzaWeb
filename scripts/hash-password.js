// Usage: node scripts/hash-password.js "your-new-password"
// Copy the printed hash into ADMIN_PASSWORD_HASH in your .env file.
const bcrypt = require("bcryptjs");

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-password.js "your-new-password"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log("\nPaste this into .env as ADMIN_PASSWORD_HASH (Next.js expands $ in .env files, so it must be escaped):\n");
console.log(hash.replace(/\$/g, "\\$"));

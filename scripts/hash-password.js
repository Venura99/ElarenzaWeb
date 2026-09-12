// Usage: node scripts/hash-password.js "your-new-password"
const bcrypt = require("bcryptjs");

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-password.js "your-new-password"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);

console.log("\nFor your LOCAL .env file (Next.js expands $ there, so it must be escaped):\n");
console.log(hash.replace(/\$/g, "\\$"));

console.log(
  "\nFor Netlify/Vercel environment variable settings (paste as-is, NO escaping — " +
    "their dashboards don't expand $ the way a local .env file does):\n"
);
console.log(hash);
console.log();

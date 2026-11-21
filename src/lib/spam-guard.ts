import crypto from "crypto";

/**
 * Submission guard for the public review form.
 *
 * The form was completely open: no rate limit, no challenge, nothing. Removing
 * the photo upload takes away the expensive half of that — nobody can push
 * gigabytes into the Cloudinary account any more — but the form itself can
 * still be posted to in a loop, and every submission lands in the moderation
 * queue for a person to wade through.
 *
 * Three cheap layers, none of which ask the customer to do anything:
 *
 *   1. A honeypot field, hidden from people and filled in by naive bots.
 *   2. A signed timestamp issued when the page renders. A real person takes
 *      longer than a couple of seconds to write a review, and the signature
 *      stops the value being forged or replayed indefinitely.
 *   3. A check for links, which is what nearly all review spam is actually
 *      for, and which a genuine review of a perfume almost never contains.
 *
 * None of this is a substitute for Cloudflare Turnstile against a determined
 * attacker. It is the layer that works without the shop owner having to
 * provision anything.
 */

/** Hidden input name. Deliberately plausible so a bot wants to fill it. */
export const HONEYPOT_FIELD = "website";
export const TIMESTAMP_FIELD = "formToken";

const MIN_FILL_SECONDS = 3;
const MAX_FORM_AGE_SECONDS = 60 * 60 * 2;

function secret() {
  // Falls back only so local development without a secret still works; in
  // production SESSION_SECRET is always set.
  return process.env.SESSION_SECRET || "elarenza-dev-secret";
}

function sign(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}

/** Issued server-side when the form renders, verified when it is submitted. */
export function issueFormToken(): string {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${sign(issuedAt)}`;
}

export type GuardResult = { ok: true } | { ok: false; reason: string };

export function checkSubmission(formData: FormData, message: string): GuardResult {
  if (String(formData.get(HONEYPOT_FIELD) ?? "").trim() !== "") {
    return { ok: false, reason: "honeypot" };
  }

  const token = String(formData.get(TIMESTAMP_FIELD) ?? "");
  const [issuedAt, signature] = token.split(".");

  if (!issuedAt || !signature) return { ok: false, reason: "missing token" };

  const expected = sign(issuedAt);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: "bad token" };
  }

  const ageSeconds = (Date.now() - Number(issuedAt)) / 1000;
  if (!Number.isFinite(ageSeconds) || ageSeconds < MIN_FILL_SECONDS) {
    return { ok: false, reason: "too fast" };
  }
  if (ageSeconds > MAX_FORM_AGE_SECONDS) {
    return { ok: false, reason: "expired" };
  }

  if (/https?:\/\/|www\.|\[url|<a\s/i.test(message)) {
    return { ok: false, reason: "contains a link" };
  }

  return { ok: true };
}

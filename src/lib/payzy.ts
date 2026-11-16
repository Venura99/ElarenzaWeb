import crypto from "crypto";

/**
 * Payzy custom checkout.
 *
 * The signature is an HMAC-SHA256 (base64) over a canonical "name=value"
 * string joined with commas, in the exact order of signed_field_names.
 *
 * Everything here runs server-side: the shop key never reaches the browser,
 * and a payment is only treated as settled once the returned signature has
 * been recomputed here and matched.
 */

export const PAYZY_FIELD_ORDER = [
  "x_test_mode",
  "x_shopid",
  "x_amount",
  "x_order_id",
  "x_response_url",
  "x_first_name",
  "x_last_name",
  "x_company",
  "x_address",
  "x_country",
  "x_state",
  "x_city",
  "x_zip",
  "x_phone",
  "x_email",
  "x_ship_to_first_name",
  "x_ship_to_last_name",
  "x_ship_to_company",
  "x_ship_to_address",
  "x_ship_to_country",
  "x_ship_to_state",
  "x_ship_to_city",
  "x_ship_to_zip",
  "x_freight",
  "x_platform",
  "x_version",
] as const;

export type PayzyFields = Record<(typeof PAYZY_FIELD_ORDER)[number], string>;

const REQUEST_SIGNED_FIELD_NAMES = [...PAYZY_FIELD_ORDER, "signed_field_names"].join(",");
const RESPONSE_SIGNED_FIELD_NAMES = [
  "response_code",
  ...PAYZY_FIELD_ORDER,
  "signed_field_names",
].join(",");

function config() {
  const key = process.env.PAYZY_SHOP_KEY;
  const shopId = process.env.PAYZY_SHOP_ID;
  if (!key || !shopId) {
    throw new Error("Payzy is not configured (PAYZY_SHOP_ID / PAYZY_SHOP_KEY).");
  }
  // Test mode keeps the sandbox host and the gateway's own test flag in step,
  // so there is no way to point production credentials at the sandbox.
  const testMode = process.env.PAYZY_TEST_MODE !== "off";
  return {
    key,
    shopId,
    testMode,
    baseUrl: testMode ? "https://api.payzypay.xyz" : "https://api.payzy.lk",
  };
}

export function payzyConfigured() {
  return Boolean(process.env.PAYZY_SHOP_ID && process.env.PAYZY_SHOP_KEY);
}

export function isPayzyTestMode() {
  return process.env.PAYZY_TEST_MODE !== "off";
}

function sign(canonical: string, key: string) {
  return crypto.createHmac("sha256", key).update(canonical).digest("base64");
}

function requestCanonical(fields: PayzyFields) {
  const parts = PAYZY_FIELD_ORDER.map((name) => `${name}=${fields[name]}`);
  parts.push(`signed_field_names=${REQUEST_SIGNED_FIELD_NAMES}`);
  return parts.join(",");
}

function responseCanonical(fields: PayzyFields, responseCode: string) {
  const parts = [`response_code=${responseCode}`];
  for (const name of PAYZY_FIELD_ORDER) parts.push(`${name}=${fields[name]}`);
  parts.push(`signed_field_names=${RESPONSE_SIGNED_FIELD_NAMES}`);
  return parts.join(",");
}

export function buildPayzyFields(input: {
  orderId: string;
  amount: number;
  responseUrl: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  district: string;
  phone: string;
  email: string;
  deliveryFee: number;
}): PayzyFields {
  const { shopId, testMode } = config();
  return {
    x_test_mode: testMode ? "on" : "off",
    x_shopid: shopId,
    // Gateways reject trailing-precision mismatches, so always send 2dp.
    x_amount: input.amount.toFixed(2),
    x_order_id: input.orderId,
    x_response_url: input.responseUrl,
    x_first_name: input.firstName,
    x_last_name: input.lastName,
    x_company: "",
    x_address: input.address,
    x_country: "Sri Lanka",
    x_state: input.district,
    x_city: input.city,
    x_zip: "",
    x_phone: input.phone,
    x_email: input.email,
    x_ship_to_first_name: input.firstName,
    x_ship_to_last_name: input.lastName,
    x_ship_to_company: "",
    x_ship_to_address: input.address,
    x_ship_to_country: "Sri Lanka",
    x_ship_to_state: input.district,
    x_ship_to_city: input.city,
    x_ship_to_zip: "",
    x_freight: input.deliveryFee.toFixed(2),
    x_platform: "custom",
    x_version: "1.0",
  };
}

/** Creates the hosted checkout session and returns the URL to send the customer to. */
export async function createPayzyCheckout(fields: PayzyFields): Promise<string> {
  const { key, baseUrl } = config();

  const body = {
    ...fields,
    signed_field_names: REQUEST_SIGNED_FIELD_NAMES,
    signature: sign(requestCanonical(fields), key),
  };

  const res = await fetch(`${baseUrl}/checkout/custom-checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Payzy checkout failed (HTTP ${res.status})`);
  }

  const data = (await res.json()) as { url?: string };
  if (!data?.url) {
    throw new Error("Payzy did not return a checkout URL");
  }
  return data.url;
}

/**
 * Recomputes the signature over the fields originally sent plus the returned
 * response_code. A mismatch means the callback was not produced by Payzy.
 */
export function verifyPayzyReturn(
  fields: PayzyFields,
  responseCode: string,
  receivedSignature: string
): boolean {
  const { key } = config();
  const expected = sign(responseCanonical(fields, responseCode), key);

  // "+" survives the query string as a space, so restore it before comparing.
  const received = receivedSignature.replace(/ /g, "+");

  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export const PAYZY_SUCCESS_CODE = "00";

/**
 * The WhatsApp screenshots cleared for public display.
 *
 * Every screenshot in "customer feedback screenshots" was cropped by
 * scripts/prepare-testimonials.js, which removes the chat header — the
 * customer's name or number, their profile photograph and their last-seen
 * status. That crop is reliable because it is positional.
 *
 * It does nothing for what is inside the conversation, and a review of all 48
 * found a great deal there: full Sri Lankan mobile numbers quoted in reply
 * blocks, customers' full names, a courier branch number with a waybill id,
 * and parcel photographs whose shipping labels carry a delivery address.
 *
 * So this is an allowlist, not a filter. A screenshot appears on the site only
 * because it was looked at and found clean. Anything carrying a number, a
 * name, a waybill, a legible shipping label or a customer's own photograph is
 * left out, and the reason is recorded in EXCLUDED below so the decision can
 * be re-examined rather than guessed at later.
 *
 * Adding a screenshot here publishes it. Look at it first.
 */

export type Testimonial = {
  /** File under public/images/testimonials. */
  id: string;
  /** Describes the message for screen readers; never identifies the customer. */
  alt: string;
  /** Shown on the home page. The clearest, most legible ones. */
  featured?: boolean;
};

export const TESTIMONIALS: Testimonial[] = [
  { id: "testimonial-31", alt: "Customer message: received the parcel, fast delivery, packing was good and the perfumes were better than expected", featured: true },
  { id: "testimonial-48", alt: "Customer message praising the price, the service and recommending the product with a five star rating", featured: true },
  { id: "testimonial-41", alt: "Customer message: order found, a great product, recommendations are excellent", featured: true },
  { id: "testimonial-02", alt: "Customer message: received the product and it smells so good", featured: true },
  { id: "testimonial-44", alt: "Customer message thanking us for the order and asking to order another bottle", featured: true },
  { id: "testimonial-40", alt: "Customer message: your service is superb, thank you so much", featured: true },
  { id: "testimonial-38", alt: "Customer message: received the order without any problems", featured: true },
  { id: "testimonial-46", alt: "Customer confirming the order arrived and thanking us", featured: true },

  { id: "testimonial-01", alt: "Customer sharing a photo of the decant they received" },
  { id: "testimonial-03", alt: "Customer message: got my perfume, really very nice smell" },
  { id: "testimonial-04", alt: "Customer message confirming the bottle arrived, with thanks" },
  { id: "testimonial-05", alt: "Customer message: thank you so much, I received my order" },
  { id: "testimonial-06", alt: "Customer confirming the courier reached them and the package arrived" },
  { id: "testimonial-07", alt: "Customer message: it smells good, an original product" },
  { id: "testimonial-09", alt: "Customer photo of the decant received, with thanks" },
  { id: "testimonial-15", alt: "Customer message confirming the order arrived" },
  { id: "testimonial-16", alt: "Customer photo of the decant received" },
  { id: "testimonial-19", alt: "Customer message: the parcel arrived, thank you" },
  { id: "testimonial-20", alt: "Customer message: package received today, good quality" },
  { id: "testimonial-21", alt: "Customer message: got the perfume, perfect and long lasting" },
  { id: "testimonial-24", alt: "Customer photo of the decant in hand, confirming it arrived" },
  { id: "testimonial-26", alt: "Customer thanking us before travelling abroad" },
  { id: "testimonial-28", alt: "Customer photo of two decants received, with thanks" },
  { id: "testimonial-32", alt: "Customer confirming the order was sent" },
  { id: "testimonial-33", alt: "Customer message: got the order, thank you very much" },
  { id: "testimonial-39", alt: "Customer photo of several decants received" },
  { id: "testimonial-42", alt: "Customer photo of the full bottle received, described as superb" },
  { id: "testimonial-45", alt: "Customer confirming the order arrived" },
];

/**
 * Deliberately not published, with the reason. Kept so the next person does
 * not have to re-derive these decisions — or quietly undo them.
 */
export const EXCLUDED: Record<string, string> = {
  "testimonial-08": "automated message branded for another business",
  "testimonial-10": "customer's name visible in a quoted reply",
  "testimonial-11": "shipping label legible in the parcel photo",
  "testimonial-12": "customer's name visible in a quoted reply",
  "testimonial-13": "customer's name visible in a quoted reply",
  "testimonial-14": "shipping label legible in the parcel photo",
  "testimonial-17": "shipping label legible in the parcel photo",
  "testimonial-18": "shipping label legible in the parcel photo",
  "testimonial-22": "courier branch telephone number and waybill id in the message",
  "testimonial-23": "shipping label legible in the parcel photo",
  "testimonial-25": "full mobile number in a quoted reply",
  "testimonial-27": "shipping label legible in the parcel photo",
  "testimonial-29": "customer's full name repeated in quoted replies",
  "testimonial-30": "full mobile number and a reference number in the message",
  "testimonial-34": "full mobile number and partial name in a quoted reply",
  "testimonial-35": "customer's own photograph, not about the product",
  "testimonial-36": "full mobile number and full name in a quoted reply",
  "testimonial-37": "full mobile number and name in a quoted reply",
  "testimonial-43": "full mobile number in two quoted replies",
  "testimonial-47": "full mobile number and username in a quoted reply",
};

export const FEATURED_TESTIMONIALS = TESTIMONIALS.filter((t) => t.featured);

export function testimonialSrc(id: string) {
  return `/images/testimonials/${id}.webp`;
}

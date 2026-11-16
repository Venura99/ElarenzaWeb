import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/constants";
import { formatLKR } from "@/lib/format";
import { getDeliveryFee, getPayzyFeePercent } from "@/lib/settings";
import { PolicyShell, PolicySection, PolicyList } from "@/components/site/PolicyPage";

export const metadata: Metadata = {
  title: `Terms & Conditions | ${BUSINESS.name}`,
  description: `The terms that apply when you buy perfume decants or full bottles from ${BUSINESS.name}, including delivery, payment and our replacement policy.`,
};

// The delivery charge and online payment fee are quoted from the live settings
// so this page cannot drift out of step with what checkout actually charges.
export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const [deliveryFee, payzyFeePercent] = await Promise.all([
    getDeliveryFee(),
    getPayzyFeePercent(),
  ]);

  return (
    <PolicyShell
      eyebrow="Legal"
      title="Terms & Conditions"
      intro={
        <>
          These terms apply when you buy from {BUSINESS.name} through
          elarenza.lk. Placing an order means you accept them. Please read the
          sections on delivery and on replacements, as they explain exactly what
          we can and cannot do if something goes wrong.
        </>
      }
    >
      <PolicySection heading="1. Who you are buying from">
        <p>
          {BUSINESS.name}, {BUSINESS.addressLines.join(", ")}. You can reach us
          on WhatsApp or by phone at {BUSINESS.phoneDisplay}. WhatsApp is the
          fastest way to get a reply.
        </p>
      </PolicySection>

      <PolicySection heading="2. Our products">
        <p>
          We sell <strong>decants</strong> and <strong>full bottles</strong> of
          designer and niche fragrances.
        </p>
        <PolicyList>
          <li>
            A decant is a smaller quantity transferred by us from a larger
            authentic bottle into a clean travel bottle or atomiser. It is not
            sold in the original manufacturer&apos;s packaging.
          </li>
          <li>
            Decant volumes are filled as accurately as we can and may vary very
            slightly. Atomiser and bottle styles may change depending on stock.
          </li>
          <li>
            Brand names are the trademarks of their respective owners. We use
            them only to describe which fragrance is inside. We are not an
            authorised dealer of, affiliated with, or endorsed by any of these
            brands.
          </li>
          <li>
            Product photographs are for illustration. Actual packaging can
            differ, and a fragrance can smell slightly different on different
            skin.
          </li>
        </PolicyList>
      </PolicySection>

      <PolicySection heading="3. Prices and charges">
        <PolicyList>
          <li>All prices are shown in Sri Lankan Rupees (LKR).</li>
          <li>
            A delivery charge of <strong>{formatLKR(deliveryFee)}</strong>{" "}
            applies and is shown on the checkout page before you confirm. We may
            change this charge at any time, but never after you have placed an
            order.
          </li>
          <li>
            If you choose to pay online by card, an online payment fee of{" "}
            <strong>{payzyFeePercent}%</strong> is added to cover the payment
            provider&apos;s charge. It is shown as a separate line at checkout
            before you pay. Cash on delivery has no such fee.
          </li>
          <li>
            The total shown at checkout is the final amount payable. We may
            correct an obvious pricing error before confirming an order, and
            will tell you if we do.
          </li>
        </PolicyList>
      </PolicySection>

      <PolicySection heading="4. Payment">
        <p>
          You can pay <strong>cash on delivery</strong>, or{" "}
          <strong>online by card</strong> through PayZy. Card payments are
          processed on PayZy&apos;s secure page and your card details are never
          handled by us. An order paid online is only treated as paid once PayZy
          confirms the payment to us.
        </p>
        <p>
          For cash on delivery, please have the exact total ready. The courier
          may be unable to provide change.
        </p>
      </PolicySection>

      <PolicySection heading="5. Orders and confirmation">
        <p>
          Placing an order is a request to buy, not a completed contract. We
          confirm your order with you on WhatsApp, and the sale is formed once
          we confirm it.
        </p>
        <p>
          We may decline or cancel an order if an item turns out to be out of
          stock, if your contact details cannot be verified, if the delivery
          address is outside our service area, or if we suspect fraud. If you
          have already paid for an order we cancel, we refund it in full.
        </p>
      </PolicySection>

      <PolicySection heading="6. Delivery">
        <PolicyList>
          <li>
            We deliver <strong>islandwide across Sri Lanka</strong>, usually
            within <strong>2&ndash;5 working days</strong> of confirming your
            order.
          </li>
          <li>
            These timeframes are estimates. Courier delays, weather, strikes,
            public holidays and remote locations can take longer, and we are not
            liable for delays outside our control.
          </li>
          <li>
            Please give an accurate address and a phone number you answer. If a
            delivery fails because the address was wrong or nobody was reachable,
            a re-delivery may incur a further delivery charge.
          </li>
          <li>
            Risk in the goods passes to you on delivery. Please check your parcel
            when it arrives.
          </li>
        </PolicyList>
      </PolicySection>

      <PolicySection heading="7. Replacements and refunds">
        <p>
          Because fragrances are personal care products, we{" "}
          <strong>cannot accept returns of opened items</strong>, and we cannot
          offer a refund simply because a scent is not to your taste. This is a
          hygiene and authenticity measure and it protects every customer.
        </p>
        <p>
          <strong>
            We will replace or refund an item that arrives damaged, leaking, or
            is not what you ordered.
          </strong>{" "}
          To claim:
        </p>
        <PolicyList>
          <li>
            Message us on WhatsApp <strong>within 48 hours</strong> of receiving
            your parcel.
          </li>
          <li>
            Send clear photos of the item and the packaging as you received it.
          </li>
          <li>
            Keep the item and its packaging until we have resolved the claim.
          </li>
        </PolicyList>
        <p>
          Once we have confirmed the problem we will send a replacement or
          refund you, whichever you prefer and we have in stock. Refunds for card
          payments are returned through PayZy to the card used, and can take
          several working days to appear. The online payment fee is refunded
          along with a full refund.
        </p>
        <p>
          Claims made after 48 hours, or for items with no photographic evidence
          of the fault on arrival, may not be accepted.
        </p>
      </PolicySection>

      <PolicySection heading="8. Reviews and photos you submit">
        <PolicyList>
          <li>
            By submitting a review or photo you give us permission to display it
            on this website, with the name you entered.
          </li>
          <li>
            Only submit words and photos that are your own and that you have the
            right to share. Do not include other people&apos;s personal details.
          </li>
          <li>
            Reviews are checked before they appear. We may decline or remove a
            review that is abusive, misleading, off-topic, spam, or not from a
            genuine customer.
          </li>
          <li>
            You can ask us to remove your review at any time by messaging us on
            WhatsApp.
          </li>
        </PolicyList>
      </PolicySection>

      <PolicySection heading="9. Using fragrance safely">
        <p>
          Our products are for external use on skin or clothing only. Do not
          swallow them, and keep them away from your eyes. Fragrances contain
          alcohol: keep them away from flame, direct heat and children.
        </p>
        <p>
          If you have sensitive skin, test a small amount first and stop using
          the product if any irritation appears. We cannot know your individual
          sensitivities and are not liable for an allergic reaction to an
          authentic product used as intended.
        </p>
      </PolicySection>

      <PolicySection heading="10. Our content">
        <p>
          The text, layout, logo and photographs we produce for elarenza.lk
          belong to {BUSINESS.name}. Please do not copy them for commercial use
          without asking us first.
        </p>
      </PolicySection>

      <PolicySection heading="11. Limits on our liability">
        <p>
          Our responsibility for any order is limited to the amount you paid for
          that order, including the delivery charge. We are not liable for
          indirect losses such as lost time, lost profit or disappointment.
          Nothing in these terms removes any right you have under Sri Lankan
          consumer protection law that cannot be excluded.
        </p>
      </PolicySection>

      <PolicySection heading="12. Changes and governing law">
        <p>
          We may update these terms. The version published on this page when you
          place your order is the version that applies to it. These terms are
          governed by the laws of Sri Lanka, and disputes fall to the courts of
          Sri Lanka.
        </p>
      </PolicySection>

      <PolicySection heading="13. Contact us">
        <p>
          Something not covered here? Message us on{" "}
          <a
            href={`https://wa.me/${BUSINESS.phoneWhatsApp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gold-dark hover:underline"
          >
            WhatsApp
          </a>{" "}
          or call {BUSINESS.phoneDisplay}. See also our{" "}
          <Link href="/privacy" className="font-medium text-gold-dark hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </PolicySection>
    </PolicyShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/constants";
import { formatLKR } from "@/lib/format";
import { getDeliveryFee, getPayzyFeePercent } from "@/lib/settings";
import Breadcrumbs from "@/components/site/Breadcrumbs";

// Delivery charge and online payment fee are quoted from live settings, so
// this page cannot contradict checkout or the terms page.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers about Elarenza perfume decants — authenticity, decant sizes, delivery times across Sri Lanka, cash on delivery, card payment and our replacement policy.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const [deliveryFee, payzyFeePercent] = await Promise.all([
    getDeliveryFee(),
    getPayzyFeePercent(),
  ]);

  const faqs: { question: string; answer: string }[] = [
    {
      question: "Are your perfumes original?",
      answer:
        "Yes. Every fragrance we sell is authentic. Full bottles are sold sealed in their original packaging, and decants are transferred by hand from genuine full bottles that we buy ourselves. We do not sell imitations, testers passed off as retail, or refills.",
    },
    {
      question: "What is a perfume decant?",
      answer:
        "A decant is a smaller quantity of an authentic perfume, transferred from a full bottle into a clean travel atomiser. It lets you wear a luxury fragrance for days or weeks at a fraction of the price of a full bottle, which is the honest way to find out whether a scent actually suits you and your skin before committing.",
    },
    {
      question: "How long will a decant last me?",
      answer:
        "As a rough guide, a 3ml decant gives you around 30 to 40 sprays, which is roughly a month of wearing it a couple of times a week. A 5ml decant gives around 50 to 60 sprays. If you are testing a new scent, start small — you can always come back for a full bottle.",
    },
    {
      question: "Do decants come in the original bottle?",
      answer:
        "No. A decant is supplied in a clean travel atomiser, not the brand's own packaging, because the fragrance has been transferred from a larger bottle. The liquid inside is the authentic product. If you want the original bottle and box, choose a full bottle instead.",
    },
    {
      question: "How long does delivery take?",
      answer:
        "We deliver islandwide across Sri Lanka, usually within 2 to 5 working days of confirming your order. Remote areas, public holidays and weather can add time. We confirm every order on WhatsApp so you always know where it stands.",
    },
    {
      question: "How much is delivery?",
      answer: `Delivery is ${formatLKR(deliveryFee)} anywhere in Sri Lanka. The charge is shown on the checkout page before you confirm, so there is never a surprise at the door.`,
    },
    {
      question: "Do you offer cash on delivery?",
      answer:
        "Yes. Cash on delivery is available islandwide and carries no extra fee. Please have the exact total ready, as the courier may not be able to give change.",
    },
    {
      question: "Can I pay online by card?",
      answer: `Yes. Card payments are handled by PayZy on their own secure page, so your card details never reach our website. An online payment fee of ${payzyFeePercent}% is added to cover the payment provider's charge, and it is shown as a separate line at checkout before you pay. Cash on delivery has no such fee.`,
    },
    {
      question: "Can I return a perfume if I don't like it?",
      answer:
        "Because fragrance is a personal care product, we cannot accept returns of opened items, and we cannot refund a scent simply because it is not to your taste — that is exactly why we sell decants, so you can try a fragrance cheaply first. If your item arrives damaged, leaking or is not what you ordered, message us on WhatsApp within 48 hours with photos and we will replace it or refund you.",
    },
    {
      question: "How do I know which size to choose?",
      answer:
        "If you have never worn the fragrance before, choose the smallest decant. If you already know you like it, a larger decant usually works out cheaper per millilitre, and a full bottle is the best value of all if it is a scent you wear regularly.",
    },
    {
      question: "Do you deliver outside Colombo?",
      answer:
        "Yes, we deliver to all 25 districts of Sri Lanka at the same delivery charge. Just select your district at checkout.",
    },
    {
      question: "How do I track or change my order?",
      answer: `Message us on WhatsApp at ${BUSINESS.phoneDisplay}. Every order is confirmed there, so it is the fastest way to add delivery instructions, change an address or ask where your parcel is.`,
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Breadcrumbs items={[{ name: "FAQ" }]} />

      <p className="text-xs uppercase tracking-[0.25em] text-gold-dark">Help</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">Frequently Asked Questions</h1>
      <p className="mt-3 leading-relaxed text-ink-soft">
        Everything customers usually ask before their first order. If your
        question is not here, message us on WhatsApp — we reply quickly.
      </p>

      <div className="mt-10 divide-y divide-gold-light/40 border-y border-gold-light/40">
        {faqs.map((faq) => (
          <details key={faq.question} className="group py-5">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-serif text-lg text-ink marker:content-none">
              <span>{faq.question}</span>
              <span
                aria-hidden="true"
                className="mt-1 shrink-0 text-xl leading-none text-gold transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 leading-relaxed text-ink-soft">{faq.answer}</p>
          </details>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-gold-light/40 bg-white p-6 text-center">
        <h2 className="font-serif text-xl text-ink">Still have a question?</h2>
        <p className="mt-2 text-sm text-ink-soft">
          We answer every message personally.
        </p>
        <a
          href={`https://wa.me/${BUSINESS.phoneWhatsApp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-full bg-[#25D366] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Ask on WhatsApp
        </a>
        <p className="mt-4 text-xs text-ink-soft">
          See also our{" "}
          <Link href="/terms" className="font-medium text-gold-dark hover:underline">
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-gold-dark hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

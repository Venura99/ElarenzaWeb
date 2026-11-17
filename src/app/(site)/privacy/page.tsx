import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/constants";
import { PolicyShell, PolicySection, PolicyList } from "@/components/site/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${BUSINESS.name} collects, uses and protects your personal information when you order perfumes or leave a review.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyShell
      eyebrow="Legal"
      title="Privacy Policy"
      intro={
        <>
          This policy explains what personal information {BUSINESS.name}{" "}
          collects when you use <strong>elarenza.lk</strong>, why we collect it,
          who we share it with, and how you can ask us to change or delete it.
          We only ask for what we genuinely need to get your order to your door.
        </>
      }
    >
      <PolicySection heading="1. Who we are">
        <p>
          {BUSINESS.name} sells perfume decants and full bottles in Sri Lanka
          and operates the website elarenza.lk. We are the party responsible for
          the personal information described in this policy.
        </p>
        <p>
          {BUSINESS.addressLines.join(", ")}
          <br />
          Phone / WhatsApp: {BUSINESS.phoneDisplay}
        </p>
      </PolicySection>

      <PolicySection heading="2. What we collect">
        <p>
          <strong>When you place an order</strong>, we collect the details you
          type into the checkout form:
        </p>
        <PolicyList>
          <li>Your name</li>
          <li>Your phone number</li>
          <li>Your delivery address, city and district</li>
          <li>Any delivery notes you choose to add</li>
          <li>The items, quantities and amounts in your order</li>
        </PolicyList>
        <p>
          <strong>If you pay online by card</strong>, we also ask for your email
          address. This is passed to our payment provider so they can send you a
          payment receipt.
        </p>
        <p>
          <strong>If you leave a review</strong>, we collect the name you enter,
          your star rating, your written feedback and any photos you choose to
          attach. Please only enter a name you are comfortable being shown
          publicly, and please do not include personal details in your review
          text or photos.
        </p>
      </PolicySection>

      <PolicySection heading="3. What we never see or store">
        <p>
          <strong>We do not collect or store your card details.</strong> Online
          card payments are handled entirely by PayZy, our payment provider.
          When you choose to pay online, you are taken to PayZy&apos;s own
          secure page to enter your card number, expiry date and CVV. Those
          details are never sent to elarenza.lk and we never have access to
          them. We only receive confirmation of whether the payment succeeded or
          failed, and a payment reference.
        </p>
        <p>
          We also do not ask you to create an account or a password on this
          site, so we hold no login credentials for customers.
        </p>
      </PolicySection>

      <PolicySection heading="4. Why we use your information">
        <PolicyList>
          <li>To prepare, pack and deliver your order</li>
          <li>
            To contact you on WhatsApp or by phone to confirm your order,
            arrange delivery or resolve a problem
          </li>
          <li>To take payment and, where needed, issue a refund</li>
          <li>To keep records of sales for our own accounting</li>
          <li>To publish reviews that customers have submitted for display</li>
        </PolicyList>
        <p>
          We do not use your information for automated advertising or profiling,
          and we do not send marketing messages unless you have asked us to.
        </p>
      </PolicySection>

      <PolicySection heading="5. Who we share it with">
        <p>
          We do not sell your personal information to anyone. We share only what
          is necessary with:
        </p>
        <PolicyList>
          <li>
            <strong>PayZy</strong> &mdash; our payment provider. For online card
            payments we pass your name, email, phone, address and the order
            amount so the payment can be processed and receipted.
          </li>
          <li>
            <strong>Our delivery partner or courier</strong> &mdash; your name,
            phone number and delivery address, so your parcel can reach you.
          </li>
          <li>
            <strong>Our technical service providers</strong> &mdash; the
            companies that host the website, its database and its images on our
            behalf. They store the data for us and are not permitted to use it
            for their own purposes.
          </li>
          <li>
            <strong>Authorities</strong> &mdash; if we are legally required to
            disclose information.
          </li>
        </PolicyList>
        <p>
          Some of these providers store data on servers outside Sri Lanka. We
          choose established providers that offer appropriate security
          protections.
        </p>
      </PolicySection>

      <PolicySection heading="6. Cookies and your browser">
        <p>
          This site does not use advertising or cross-site tracking cookies, and
          we do not run third-party analytics or advertising pixels.
        </p>
        <PolicyList>
          <li>
            <strong>Your cart</strong> is saved in your own browser&apos;s local
            storage so it survives a page refresh. It stays on your device and
            is only sent to us when you place an order. Clearing your browser
            data will empty your cart.
          </li>
          <li>
            <strong>A session cookie</strong> is used only for our own staff to
            stay signed in to the admin area. It is not set for customers.
          </li>
        </PolicyList>
      </PolicySection>

      <PolicySection heading="7. How long we keep it">
        <p>
          We keep order records for as long as we need them for business and
          accounting purposes, and to help you if you come back to us about a
          past order. Published reviews stay on the site until you ask us to
          remove them, or until we remove them ourselves.
        </p>
      </PolicySection>

      <PolicySection heading="8. Keeping it secure">
        <p>
          The site is served over HTTPS, administrative access is password
          protected, and payment confirmations are cryptographically verified
          before an order is marked as paid. No system can be guaranteed
          completely secure, but we take reasonable care to protect the
          information you give us.
        </p>
      </PolicySection>

      <PolicySection heading="9. Your choices and rights">
        <p>
          You can ask us to show you what information we hold about you, correct
          it if it is wrong, delete your review, or delete your details where we
          are not required to keep them. Message us on WhatsApp at{" "}
          {BUSINESS.phoneDisplay} and we will help.
        </p>
        <p>
          Sri Lanka&apos;s Personal Data Protection Act No. 9 of 2022 gives
          individuals rights over their personal data. If you believe we have
          handled your information wrongly, please contact us first so we can
          put it right.
        </p>
      </PolicySection>

      <PolicySection heading="10. Children">
        <p>
          This site is intended for adults. We do not knowingly collect
          information from children. If you believe a child has sent us personal
          information, contact us and we will delete it.
        </p>
      </PolicySection>

      <PolicySection heading="11. Changes to this policy">
        <p>
          We may update this policy as our business changes. The date at the top
          of this page shows when it was last revised.
        </p>
      </PolicySection>

      <PolicySection heading="12. Contact us">
        <p>
          Questions about your information? Message us on{" "}
          <a
            href={`https://wa.me/${BUSINESS.phoneWhatsApp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gold-dark hover:underline"
          >
            WhatsApp
          </a>{" "}
          or call {BUSINESS.phoneDisplay}. See also our{" "}
          <Link href="/terms" className="font-medium text-gold-dark hover:underline">
            Terms &amp; Conditions
          </Link>
          .
        </p>
      </PolicySection>
    </PolicyShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/layout/site-footer";
import SiteHeader from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Ordering Information",
  description:
    "How to place an order with KAMEA, choose a payment preference, and arrange delivery.",
};

const steps = [
  {
    number: "01",
    title: "Choose your piece",
    description:
      "Browse the catalogue, choose available colour and size options, and add pieces to your bag.",
  },
  {
    number: "02",
    title: "Review and send",
    description:
      "Review your selections, provide your contact and delivery details, and send your request to KAMEA on WhatsApp.",
  },
  {
    number: "03",
    title: "Confirm the details",
    description:
      "KAMEA will confirm availability, any making time, delivery options and charges, and your final order total with you.",
  },
  {
    number: "04",
    title: "Arrange payment",
    description:
      "Choose Mobile Money (MoMo), Cash, or Bank Transfer as your preference. KAMEA will share payment arrangements directly in WhatsApp.",
  },
];

export default function OrderingInformationPage() {
  return (
    <>
      <div className="announcement">
        Small-batch crochet · Made slowly, with intention
      </div>
      <SiteHeader />
      <main className="editorial-page">
        <section className="editorial-hero section-inner">
          <p className="eyebrow">A few helpful details</p>
          <h1>
            Ordering, made <em>simple.</em>
          </h1>
          <p>
            Every order is confirmed personally with KAMEA, so you can ask
            questions and make sure the details feel right.
          </p>
        </section>
        <section className="section soft-section">
          <div className="section-inner">
            <div className="ordering-steps">
              {steps.map((step) => (
                <article className="ordering-step" key={step.number}>
                  <span>{step.number}</span>
                  <div>
                    <h2>{step.title}</h2>
                    <p>{step.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="section">
          <div className="section-inner ordering-details-grid">
            <article>
              <p className="eyebrow">Payment</p>
              <h2 className="section-title">
                Choose what <em>suits you.</em>
              </h2>
              <p>
                Mobile Money (MoMo), Cash, and Bank Transfer are available as
                payment preferences. Payment is arranged directly with KAMEA
                on WhatsApp. This website does not collect or process payment.
              </p>
            </article>
            <article>
              <p className="eyebrow">Delivery & making time</p>
              <h2 className="section-title">
                Confirmed <em>together.</em>
              </h2>
              <p>
                Delivery areas, delivery charges, and estimated making times
                depend on the piece and your location. KAMEA will confirm
                those details before your order is final. No fixed delivery
                schedule or fee has been provided yet.
              </p>
            </article>
            <article>
              <p className="eyebrow">Custom pieces</p>
              <h2 className="section-title">
                Your idea, <em>by hand.</em>
              </h2>
              <p>
                Share the piece you have in mind, preferred colours, size or
                measurements, and any inspiration. KAMEA will confirm what is
                possible, the price, and timing before work begins.
              </p>
              <Link className="text-link" href="/contact#custom-request">
                Make a custom request
              </Link>
            </article>
          </div>
        </section>
        <section className="ordering-note soft-section">
          <div className="section-inner">
            <p>
              Prices shown in the catalogue are in Ghana cedis (GHS) and are
              estimates until KAMEA confirms your order. Delivery and
              customisation charges, if any, are confirmed separately.
            </p>
            <Link className="button-link" href="/catalogue">
              Browse the catalogue
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

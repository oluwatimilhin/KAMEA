import type { Metadata } from "next";
import CustomRequestForm from "@/components/contact/custom-request-form";
import SiteFooter from "@/components/layout/site-footer";
import SiteHeader from "@/components/layout/site-header";
import { getWhatsAppConfiguration } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact KAMEA",
  description:
    "Get in touch with KAMEA about an order or share an idea for a custom crochet piece.",
};

export default function ContactPage() {
  const { number } = getWhatsAppConfiguration();
  const whatsappUrl = number ? `https://wa.me/${number}` : null;

  return (
    <>
      <div className="announcement">
        Small-batch crochet · Made slowly, with intention
      </div>
      <SiteHeader />
      <main className="editorial-page">
        <section className="editorial-hero section-inner">
          <p className="eyebrow">We would love to hear from you</p>
          <h1>
            Let&apos;s make something <em>personal.</em>
          </h1>
          <p>
            Ask about a piece, your order, or a crochet idea you would like to
            bring to life.
          </p>
        </section>
        <section className="section soft-section">
          <div className="section-inner contact-layout">
            <div className="contact-information">
              <p className="eyebrow">Contact KAMEA</p>
              <h2 className="section-title">
                Here to help, <em>by conversation.</em>
              </h2>
              <p>
                For the quickest response, send a WhatsApp message. We can
                confirm the best contact hours and other ways to reach KAMEA
                once those details are available.
              </p>
              {whatsappUrl ? (
                <a
                  className="button-link"
                  href={whatsappUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Message KAMEA on WhatsApp
                </a>
              ) : (
                <p className="placeholder-note">
                  WhatsApp contact: number to be provided by KAMEA. The shop
                  owner can configure it with{" "}
                  <code>NEXT_PUBLIC_WHATSAPP_NUMBER</code>.
                </p>
              )}
              <dl className="contact-placeholders">
                <div>
                  <dt>Email</dt>
                  <dd>To be provided by KAMEA</dd>
                </div>
                <div>
                  <dt>Studio / collection location</dt>
                  <dd>To be provided by KAMEA</dd>
                </div>
                <div>
                  <dt>Business hours</dt>
                  <dd>To be provided by KAMEA</dd>
                </div>
              </dl>
            </div>
            <section
              aria-labelledby="custom-request-title"
              className="custom-request-card"
              id="custom-request"
            >
              <p className="eyebrow">Made for you</p>
              <h2 id="custom-request-title">Tell us your crochet idea.</h2>
              <p>
                A few details help us understand what you are imagining.
                Nothing is confirmed until KAMEA replies with availability,
                price, and timing.
              </p>
              <CustomRequestForm />
            </section>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import SiteFooter from "@/components/layout/site-footer";
import SiteHeader from "@/components/layout/site-header";
import { useCart } from "@/components/shop/cart-context";
import { formatPrice } from "@/lib/products";
import { getProductAvailability } from "@/lib/products";
import {
  createWhatsAppOrderLink,
  createWhatsAppOrderMessage,
  getWhatsAppConfiguration,
  type PaymentPreference,
} from "@/lib/whatsapp";

const paymentOptions: PaymentPreference[] = [
  "Mobile Money (MoMo)",
  "Cash",
  "Bank Transfer",
];

export default function CheckoutPage() {
  const {
    cart,
    isHydrated,
    products,
    removeItem,
    setItemQuantity,
  } = useCart();
  const [paymentPreference, setPaymentPreference] =
    useState<PaymentPreference>("Mobile Money (MoMo)");
  const [submitNotice, setSubmitNotice] = useState("");
  const [fallbackLink, setFallbackLink] = useState("");
  const whatsapp = getWhatsAppConfiguration();

  const cartLines = cart.flatMap((line) => {
    const product = products.find((entry) => entry.id === line.productId);
    return product ? [{ ...line, product }] : [];
  });
  const estimatedTotal = cartLines.reduce(
    (total, line) => total + line.product.price * line.quantity,
    0,
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const message = createWhatsAppOrderMessage(
      {
        customerName: String(formData.get("customerName") ?? ""),
        customerPhone: String(formData.get("customerPhone") ?? ""),
        deliveryLocation: String(formData.get("deliveryLocation") ?? ""),
        deliveryAddress: String(formData.get("deliveryAddress") ?? ""),
        paymentPreference,
        orderNotes: String(formData.get("orderNotes") ?? ""),
      },
      cart,
      products,
    );
    const link = createWhatsAppOrderLink(message);
    const whatsappWindow = window.open(link, "_blank");

    if (whatsappWindow) {
      whatsappWindow.opener = null;
      setSubmitNotice(
        "Your order message is ready in WhatsApp. Your cart is still saved here.",
      );
      setFallbackLink("");
      return;
    }

    setFallbackLink(link);
    setSubmitNotice(
      "Your browser blocked the WhatsApp window. Use the link below to continue.",
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-intro">
            <p className="eyebrow">A thoughtful final step</p>
            <h1>Review your order</h1>
            <p>
              Check your pieces, share where to deliver them, then send your
              request to KAMEA on WhatsApp.
            </p>
          </div>

          {!isHydrated ? (
            <p className="checkout-loading" role="status">
              Loading your saved bag…
            </p>
          ) : cartLines.length === 0 ? (
            <section className="checkout-empty">
              <h2>Your bag is waiting for something lovely.</h2>
              <p>Add a handmade piece to begin an order.</p>
              <Link className="button-link" href="/catalogue">
                Explore the catalogue
              </Link>
            </section>
          ) : (
            <div className="checkout-layout">
              <section aria-labelledby="checkout-items-title">
                <div className="checkout-section-heading">
                  <p className="eyebrow">01 / Your selection</p>
                  <h2 id="checkout-items-title">In your bag</h2>
                </div>
                <div className="checkout-items">
                  {cartLines.map(({ product, quantity, colour, size }) => (
                    <article
                      className="checkout-item"
                      key={`${product.id}-${colour}-${size}`}
                    >
                      <Link
                        aria-label={`View ${product.name}`}
                        className="checkout-item-image"
                        href={`/products/${product.id}`}
                        style={{ backgroundImage: `url("${product.image}")` }}
                      />
                      <div className="checkout-item-details">
                        <Link
                          className="checkout-item-name"
                          href={`/products/${product.id}`}
                        >
                          {product.name}
                        </Link>
                        <p>
                          {colour} · {size}
                        </p>
                        <p>
                          Availability:{" "}
                          {getProductAvailability(product, colour, size)}
                        </p>
                        <p className="checkout-item-price">
                          {formatPrice(product.price)} each
                        </p>
                        <div
                          aria-label={`Quantity for ${product.name}`}
                          className="cart-line-quantity"
                        >
                          <button
                            aria-label={`Decrease ${product.name} quantity`}
                            disabled={quantity <= 1}
                            onClick={() =>
                              setItemQuantity(
                                product.id,
                                colour,
                                size,
                                quantity - 1,
                              )
                            }
                            type="button"
                          >
                            −
                          </button>
                          <output>{quantity}</output>
                          <button
                            aria-label={`Increase ${product.name} quantity`}
                            onClick={() =>
                              setItemQuantity(
                                product.id,
                                colour,
                                size,
                                quantity + 1,
                              )
                            }
                            type="button"
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="checkout-remove"
                          onClick={() =>
                            removeItem(product.id, colour, size)
                          }
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                      <strong className="checkout-item-total">
                        {formatPrice(product.price * quantity)}
                      </strong>
                    </article>
                  ))}
                </div>
                <div className="checkout-total">
                  <span>Estimated order total</span>
                  <strong>{formatPrice(estimatedTotal)}</strong>
                </div>
                <p className="checkout-estimate-note">
                  This estimate excludes delivery and any customisation costs.
                  KAMEA will confirm availability, delivery charges, and the
                  final total with you on WhatsApp.
                </p>
              </section>

              <section
                aria-labelledby="checkout-details-title"
                className="checkout-form-section"
              >
                <div className="checkout-section-heading">
                  <p className="eyebrow">02 / Delivery & payment</p>
                  <h2 id="checkout-details-title">Your details</h2>
                </div>
                <form className="checkout-form" onSubmit={handleSubmit}>
                  <label className="checkout-field">
                    <span>Full name</span>
                    <input
                      autoComplete="name"
                      maxLength={100}
                      name="customerName"
                      required
                    />
                  </label>
                  <label className="checkout-field">
                    <span>Phone / WhatsApp number</span>
                    <input
                      autoComplete="tel"
                      name="customerPhone"
                      required
                      type="tel"
                    />
                  </label>
                  <label className="checkout-field">
                    <span>Town or delivery location</span>
                    <input
                      autoComplete="address-level2"
                      maxLength={120}
                      name="deliveryLocation"
                      required
                    />
                  </label>
                  <label className="checkout-field">
                    <span>Delivery address or landmark</span>
                    <textarea
                      autoComplete="street-address"
                      maxLength={300}
                      name="deliveryAddress"
                      required
                      rows={3}
                    />
                  </label>
                  <fieldset className="checkout-payment-options">
                    <legend>Preferred payment arrangement</legend>
                    <p>
                      Choose a preference. KAMEA will confirm payment
                      instructions with you in WhatsApp.
                    </p>
                    {paymentOptions.map((option) => (
                      <label className="checkout-payment-option" key={option}>
                        <input
                          checked={paymentPreference === option}
                          name="paymentPreference"
                          onChange={() => setPaymentPreference(option)}
                          type="radio"
                          value={option}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </fieldset>
                  <label className="checkout-field">
                    <span>Order note <span className="optional-label">Optional</span></span>
                    <textarea
                      maxLength={500}
                      name="orderNotes"
                      placeholder="Anything else KAMEA should know?"
                      rows={3}
                    />
                  </label>
                  <p className="checkout-payment-note">
                    No payment is taken on this website. Your selected payment
                    method is a preference only; payment and delivery are
                    arranged directly with KAMEA in WhatsApp.
                  </p>
                  {!whatsapp.configured ? (
                    <p className="checkout-config-note" role="status">
                      KAMEA&apos;s WhatsApp number has not been configured yet.
                      WhatsApp will open with your message ready, and you will
                      need to select KAMEA&apos;s chat. The shop owner can set
                      <code> NEXT_PUBLIC_WHATSAPP_NUMBER </code> to the
                      country-code-prefixed number before launch.
                    </p>
                  ) : null}
                  <button className="button-link checkout-submit" type="submit">
                    Send order request on WhatsApp
                  </button>
                  <p aria-live="polite" className="checkout-submit-notice">
                    {submitNotice}
                  </p>
                  {fallbackLink ? (
                    <a
                      className="checkout-fallback-link"
                      href={fallbackLink}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open your order in WhatsApp
                    </a>
                  ) : null}
                </form>
              </section>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

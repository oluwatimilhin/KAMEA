"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import {
  createWhatsAppOrderLink,
  getWhatsAppConfiguration,
} from "@/lib/whatsapp";

export default function CustomRequestForm() {
  const [notice, setNotice] = useState("");
  const [fallbackLink, setFallbackLink] = useState("");
  const whatsapp = getWhatsAppConfiguration();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const message = [
      "Hello KAMEA, I would like to ask about a custom crochet piece.",
      "",
      `Name: ${String(formData.get("name") ?? "").trim()}`,
      `Phone / WhatsApp: ${String(formData.get("phone") ?? "").trim()}`,
      `Piece or idea: ${String(formData.get("idea") ?? "").trim()}`,
      `Preferred colour(s): ${String(formData.get("colours") ?? "").trim() || "Open to suggestions"}`,
      `Size / approximate measurements: ${String(formData.get("measurements") ?? "").trim() || "To discuss"}`,
      `Additional details: ${String(formData.get("details") ?? "").trim() || "None"}`,
      "",
      "Please let me know whether this is possible, along with an estimated price and making time.",
    ].join("\n");
    const link = createWhatsAppOrderLink(message);
    const whatsappWindow = window.open(link, "_blank");

    if (whatsappWindow) {
      whatsappWindow.opener = null;
      setNotice(
        "Your request is ready in WhatsApp. Please review it and send it to KAMEA.",
      );
      setFallbackLink("");
      return;
    }

    setNotice("Your browser blocked the WhatsApp window. Use the link below.");
    setFallbackLink(link);
  }

  return (
    <form className="custom-request-form" onSubmit={handleSubmit}>
      <label className="checkout-field">
        <span>Your name</span>
        <input autoComplete="name" maxLength={100} name="name" required />
      </label>
      <label className="checkout-field">
        <span>Phone / WhatsApp number</span>
        <input autoComplete="tel" name="phone" required type="tel" />
      </label>
      <label className="checkout-field">
        <span>What would you like made?</span>
        <input
          maxLength={160}
          name="idea"
          placeholder="For example, a small crochet shoulder bag"
          required
        />
      </label>
      <label className="checkout-field">
        <span>Preferred colour(s) <span className="optional-label">Optional</span></span>
        <input maxLength={120} name="colours" />
      </label>
      <label className="checkout-field">
        <span>Size or approximate measurements <span className="optional-label">Optional</span></span>
        <input maxLength={160} name="measurements" />
      </label>
      <label className="checkout-field">
        <span>Anything else? <span className="optional-label">Optional</span></span>
        <textarea maxLength={600} name="details" rows={3} />
      </label>
      {!whatsapp.configured ? (
        <p className="placeholder-note">
          The WhatsApp number is not configured. You can still prepare your
          request, then select KAMEA&apos;s chat in WhatsApp.
        </p>
      ) : null}
      <button className="button-link checkout-submit" type="submit">
        Prepare custom request in WhatsApp
      </button>
      <p aria-live="polite" className="checkout-submit-notice">
        {notice}
      </p>
      {fallbackLink ? (
        <a
          className="checkout-fallback-link"
          href={fallbackLink}
          rel="noreferrer"
          target="_blank"
        >
          Open your request in WhatsApp
        </a>
      ) : null}
    </form>
  );
}

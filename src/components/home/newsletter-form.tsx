"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export default function NewsletterForm() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.get("email") }),
      });
      const result: { message?: string } = await response.json();

      if (!response.ok) {
        setMessage(
          result.message ??
            "We could not complete your sign-up. Please try again later.",
        );
        return;
      }

      setMessage(result.message ?? "You are on the list. Thank you.");
      form.reset();
    } catch (error) {
      console.error("Could not submit the KAMEA newsletter form.", error);
      setMessage(
        "We could not reach the newsletter service. Please try again later.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <form
        aria-busy={isSubmitting}
        className="newsletter-form"
        onSubmit={handleSubmit}
      >
        <label className="sr-only" htmlFor="newsletter-email">
          Your email address
        </label>
        <input
          autoComplete="email"
          id="newsletter-email"
          name="email"
          placeholder="Your email address"
          required
          type="email"
        />
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Sending…" : "Sign me up"}
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M3.5 10h12m-5-5 5 5-5 5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
          </svg>
        </button>
      </form>
      <p aria-live="polite" className="newsletter-status">
        {message}
      </p>
    </div>
  );
}

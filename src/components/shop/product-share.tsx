"use client";

import { useState } from "react";

export default function ProductShare({ name }: { name: string }) {
  const [message, setMessage] = useState("");

  async function shareProduct() {
    const shareData = {
      title: `${name} | KAMEA`,
      text: `Take a look at ${name} from KAMEA.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setMessage("Thanks for sharing.");
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("Could not share this KAMEA product.", error);
        setMessage("Sharing isn’t available right now. You can copy the page link from your browser.");
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareData.url);
      setMessage("Product link copied.");
    } catch (error) {
      console.error("Could not copy the KAMEA product link.", error);
      setMessage("Could not copy the link. Please copy the page address from your browser.");
    }
  }

  return (
    <div className="product-share">
      <button className="product-share-button" onClick={shareProduct} type="button">
        Share this piece
      </button>
      <span aria-live="polite">{message}</span>
    </div>
  );
}

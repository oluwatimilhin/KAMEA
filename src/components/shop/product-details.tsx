"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/shop/cart-context";
import { getProductAvailability, type Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { createWhatsAppOrderLink } from "@/lib/whatsapp";
import ProductShare from "@/components/shop/product-share";

export default function ProductDetails({ product }: { product: Product }) {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColour, setSelectedColour] = useState(product.colours[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState("");
  const { addItem, isWishlisted, toggleWishlist } = useCart();
  const wishlisted = isWishlisted(product.id);
  const availability = getProductAvailability(
    product,
    selectedColour,
    selectedSize,
  );
  const soldOut = availability === "Sold out";
  const orderMessage = [
    "Hello KAMEA, I would like to enquire about:",
    `${product.name} — ${formatPrice(product.price)}`,
    `Colour: ${selectedColour}`,
    `Size: ${selectedSize}`,
    `Quantity: ${quantity}`,
  ].join("\n");
  const whatsappUrl = createWhatsAppOrderLink(orderMessage);

  function addToCart() {
    addItem(product.id, quantity, selectedColour, selectedSize);
    setCartMessage(
      `${quantity} ${quantity === 1 ? "piece" : "pieces"} added to your cart.`,
    );
  }

  return (
    <div className="product-detail-layout">
      <div className="product-gallery">
        <div className="product-detail-image">
          <div
            aria-label={product.galleryImages[activeImage].alt}
            className="product-detail-photo"
            role="img"
            style={{
              backgroundImage: `url("${product.galleryImages[activeImage].src}")`,
            }}
          />
        </div>
        <div aria-label="Product images" className="product-thumbnail-list">
          {product.galleryImages.map((image, index) => (
            <button
              aria-label={`View image ${index + 1} of ${product.name}`}
              aria-pressed={activeImage === index}
              className={`product-thumbnail${activeImage === index ? " is-active" : ""}`}
              key={`${image.src}-${index}`}
              onClick={() => setActiveImage(index)}
              style={{ backgroundImage: `url("${image.src}")` }}
              type="button"
            />
          ))}
        </div>
      </div>

      <div className="product-detail-copy">
        <div className="product-detail-breadcrumb">
          <Link href="/shop">Shop</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/catalogue?category=${encodeURIComponent(product.category)}`}>
            {product.category}
          </Link>
        </div>
        <span className="eyebrow">Thoughtfully made by hand</span>
        <div className="product-detail-title-row">
          <h1 className="product-detail-title">{product.name}</h1>
          <button
            aria-label={
              wishlisted
                ? `Remove ${product.name} from wishlist`
                : `Save ${product.name} to wishlist`
            }
            aria-pressed={wishlisted}
            className={`wishlist-toggle detail-wishlist-toggle${wishlisted ? " is-saved" : ""}`}
            onClick={() => toggleWishlist(product.id)}
            type="button"
          >
            <svg
              viewBox="0 0 24 24"
              fill={wishlisted ? "currentColor" : "none"}
              aria-hidden="true"
            >
              <path
                d="M20.8 8.7c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10a4.7 4.7 0 0 1 8.8-2.2 4.7 4.7 0 0 1 8.8 2.2Z"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.4"
              />
            </svg>
          </button>
        </div>
        <p className="product-detail-price">{formatPrice(product.price)}</p>
        <p className="product-detail-description">{product.description}</p>

        <div
          aria-label={`Availability: ${availability}`}
          className={`product-detail-availability availability-${availability
            .toLowerCase()
            .replaceAll(" ", "-")}`}
        >
          <span aria-hidden="true" className="availability-dot" />
          {availability}
        </div>

        <fieldset className="product-option">
          <legend>
            Colour <span>{selectedColour}</span>
          </legend>
          <div className="product-option-list">
            {product.colours.map((colour, index) => (
              <button
                aria-pressed={selectedColour === colour}
                className={`product-option-button${selectedColour === colour ? " is-active" : ""}`}
                key={colour}
                onClick={() => setSelectedColour(colour)}
                type="button"
              >
                {colour}
                {index === 0 && product.colours.length === 1
                  ? " · Custom"
                  : ""}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="product-option">
          <legend>
            Size <span>{selectedSize}</span>
          </legend>
          <div className="product-option-list">
            {product.sizes.map((size) => (
              <button
                aria-pressed={selectedSize === size}
                className={`product-option-button${selectedSize === size ? " is-active" : ""}`}
                key={size}
                onClick={() => setSelectedSize(size)}
                type="button"
              >
                {size}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="quantity-row">
          <span>Quantity</span>
          <div aria-label="Quantity" className="quantity-control">
            <button
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              type="button"
            >
              −
            </button>
            <output aria-live="polite">{quantity}</output>
            <button
              aria-label="Increase quantity"
              onClick={() => setQuantity((current) => current + 1)}
              type="button"
            >
              +
            </button>
          </div>
        </div>

        <div className="product-purchase-actions">
          <button
            className="button-link product-add-button"
            disabled={soldOut}
            onClick={addToCart}
            type="button"
          >
            {soldOut ? "Currently sold out" : "Add to Cart"}
          </button>
          {soldOut ? (
            <a
              className="whatsapp-order-button"
              href={whatsappUrl}
              rel="noreferrer"
              target="_blank"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M20 11.7a8 8 0 0 1-11.8 7l-4.2 1.1 1.1-4.1A8 8 0 1 1 20 11.7Z"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
                <path
                  d="M9 8.5c.3-.5.6-.5.9-.5.2 0 .4 0 .5.4l.7 1.5c.1.2.1.4 0 .5l-.5.7c-.2.2-.1.4 0 .6.5.8 1.2 1.5 2 1.9.2.1.4.1.6-.1l.7-.7c.2-.2.3-.2.6-.1l1.5.7c.3.1.4.3.4.5 0 .4-.2 1-.6 1.3-.4.4-1 .6-1.6.5-1-.1-2.2-.7-3.4-1.7-1-.8-1.8-2-2-2.9-.2-.9 0-1.7.2-2.1Z"
                  fill="currentColor"
                />
              </svg>
              Ask about availability
            </a>
          ) : (
            <Link
              className="whatsapp-order-button"
              href="/checkout"
              onClick={addToCart}
            >
              Continue to order details
            </Link>
          )}
        </div>
        <p aria-live="polite" className="cart-feedback">
          {cartMessage}
        </p>
        <ProductShare name={product.name} />

        <div className="product-detail-promise">
          Made slowly, finished by hand, and packed with care.
        </div>

        <details className="product-information" open>
          <summary>Materials &amp; care</summary>
          <ul>
            {product.materials.map((material) => (
              <li key={material}>{material}</li>
            ))}
          </ul>
        </details>
        <details className="product-information">
          <summary>Piece details</summary>
          <ul>
            {product.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/shop/cart-context";
import BrandLogo from "@/components/layout/brand-logo";
import { formatPrice } from "@/lib/products";

const links = [
  { label: "Shop", href: "/shop" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Our story", href: "/about" },
  { label: "Ordering", href: "/ordering-information" },
];

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const {
    products,
    cart: items,
    itemCount,
    removeItem,
    setItemQuantity,
    wishlist,
  } = useCart();
  const cartProducts = items.flatMap((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return product
      ? [
          {
            product,
            quantity: item.quantity,
            colour: item.colour,
            size: item.size,
          },
        ]
      : [];
  });
  const cartTotal = cartProducts.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );
  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <header className="site-header">
      <nav aria-label="Main navigation" className="nav-shell">
        <Link
          aria-label="KAMEA home"
          className="brand-logo"
          href="/"
          onClick={closeMenu}
        >
          <BrandLogo />
        </Link>
        <div className={`nav-links${isOpen ? " is-open" : ""}`} id="main-menu">
          {links.map((link) => (
            <Link
              className="nav-link"
              href={link.href}
              key={link.label}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="nav-actions">
          <Link className="nav-shop" href="/catalogue">
            Shop the edit
          </Link>
          <Link
            aria-label={`Wishlist, ${wishlist.length} saved ${wishlist.length === 1 ? "piece" : "pieces"}`}
            className="wishlist-nav-link"
            href="/wishlist"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M20.8 8.7c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10a4.7 4.7 0 0 1 8.8-2.2 4.7 4.7 0 0 1 8.8 2.2Z"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.4"
              />
            </svg>
            <span>Saved</span>
            <span aria-hidden="true" className="cart-count">
              {wishlist.length}
            </span>
          </Link>
          <button
            aria-expanded={isCartOpen}
            aria-label={`Shopping bag, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
            className={`cart-toggle${isCartOpen ? " is-active" : ""}`}
            onClick={() => setIsCartOpen((open) => !open)}
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 8h14l1 12H4L5 8Z"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.4"
              />
              <path
                d="M9 9V6a3 3 0 0 1 6 0v3"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.4"
              />
            </svg>
            <span>Bag</span>
            <span aria-hidden="true" className="cart-count">
              {itemCount}
            </span>
          </button>
          <button
            aria-controls="main-menu"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            className="menu-toggle"
            onClick={() => setIsOpen((open) => !open)}
            type="button"
          >
            {isOpen ? (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="m6 6 12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                />
              </svg>
            )}
          </button>
        </div>
        {isCartOpen ? (
          <aside aria-label="Shopping bag" className="cart-panel">
            <div className="cart-panel-heading">
              <h2>Your bag</h2>
              <button
                aria-label="Close shopping bag"
                className="cart-close"
                onClick={() => setIsCartOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>
            {cartProducts.length === 0 ? (
              <div className="cart-empty">
                <p>Your bag is taking a quiet moment.</p>
                <Link
                  className="text-link"
                  href="/catalogue"
                  onClick={() => setIsCartOpen(false)}
                >
                  Browse the catalogue
                </Link>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartProducts.map(({ product, quantity, colour, size }) => (
                    <div
                      className="cart-item"
                      key={`${product.id}-${colour}-${size}`}
                    >
                      <Link
                        aria-label={`View ${product.name}`}
                        className="cart-item-image"
                        href={`/products/${product.id}`}
                        onClick={() => setIsCartOpen(false)}
                        style={{ backgroundImage: `url("${product.image}")` }}
                      />
                      <div className="cart-item-copy">
                        <Link
                          className="cart-item-name"
                          href={`/products/${product.id}`}
                          onClick={() => setIsCartOpen(false)}
                        >
                          {product.name}
                        </Link>
                        <span>
                          {formatPrice(product.price)} each
                        </span>
                        <span className="cart-item-options">
                          {colour} · {size}
                        </span>
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
                          className="cart-remove"
                          onClick={() =>
                            removeItem(product.id, colour, size)
                          }
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                      <span className="cart-item-total">
                        {formatPrice(product.price * quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="cart-total">
                  <span>Estimated subtotal</span>
                  <strong>{formatPrice(cartTotal)}</strong>
                </div>
                <p className="cart-estimate-note">
                  Delivery and any customisation costs are confirmed with
                  KAMEA before your order is final.
                </p>
                <Link
                  className="button-link cart-checkout"
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                >
                  Review your order
                </Link>
                <p className="cart-note">
                  Add your delivery details and choose a payment arrangement.
                </p>
              </>
            )}
          </aside>
        ) : null}
      </nav>
    </header>
  );
}

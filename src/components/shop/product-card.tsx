"use client";

import Link from "next/link";
import { useCart } from "@/components/shop/cart-context";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const { isWishlisted, toggleWishlist } = useCart();
  const wishlisted = isWishlisted(product.id);

  return (
    <article className="shop-product-card">
      <div className="shop-product-image">
        <Link
          aria-label={`View ${product.name} details`}
          className="shop-product-image-link"
          href={`/products/${product.id}`}
        >
          <div
            aria-label={product.imageAlt}
            className="shop-product-photo"
            role="img"
            style={{ backgroundImage: `url("${product.image}")` }}
          />
          <div className="shop-product-badges">
            {product.isNew ? <span className="shop-badge">New</span> : null}
            {product.featured ? (
              <span className="shop-badge shop-badge-featured">
                KAMEA favourite
              </span>
            ) : null}
          </div>
        </Link>
        <button
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Save ${product.name} to wishlist`
          }
          aria-pressed={wishlisted}
          className={`wishlist-toggle${wishlisted ? " is-saved" : ""}`}
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
      <div className="shop-product-details">
        <div className="shop-product-topline">
          <span className="shop-product-category">{product.category}</span>
          <span
            className={`product-availability availability-${product.availability
              .toLowerCase()
              .replaceAll(" ", "-")}`}
          >
            <span aria-hidden="true" className="availability-dot" />
            {product.availability}
          </span>
        </div>
        <h3 className="shop-product-name">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="shop-product-description">{product.description}</p>
        <p className="shop-product-price">{formatPrice(product.price)}</p>
      </div>
    </article>
  );
}

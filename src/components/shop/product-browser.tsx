"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/shop/product-card";
import type { ProductCategory } from "@/lib/products";
import { useCart } from "@/components/shop/cart-context";

type SortOrder = "featured" | "price-low" | "price-high" | "name";

const sortLabels: Record<SortOrder, string> = {
  featured: "Featured",
  "price-low": "Price: low to high",
  "price-high": "Price: high to low",
  name: "Name: A to Z",
};

export default function ProductBrowser({
  initialCategory = "All",
  featuredOnly = false,
  wishlistOnly = false,
}: {
  initialCategory?: ProductCategory | "All";
  featuredOnly?: boolean;
  wishlistOnly?: boolean;
}) {
  const [category, setCategory] = useState<ProductCategory | "All">(
    initialCategory,
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>("featured");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [search, setSearch] = useState("");
  const { wishlist, products, categories } = useCart();

  const visibleProducts = useMemo(() => {
    const searchTerm = search.trim().toLocaleLowerCase();
    const filteredProducts = products.filter((product) => {
      if (featuredOnly && !product.featured) return false;
      if (wishlistOnly && !wishlist.includes(product.id)) return false;
      if (category !== "All" && product.category !== category) return false;
      if (availableOnly && product.availability === "Sold out") return false;
      if (
        searchTerm &&
        ![
          product.name,
          product.category,
          product.description,
          ...product.colours,
          ...product.materials,
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(searchTerm)
      ) {
        return false;
      }
      return true;
    });

    return filteredProducts.sort((first, second) => {
      switch (sortOrder) {
        case "price-low":
          return first.price - second.price;
        case "price-high":
          return second.price - first.price;
        case "name":
          return first.name.localeCompare(second.name);
        default:
          return (
            Number(Boolean(second.featured)) - Number(Boolean(first.featured)) ||
            products.indexOf(first) - products.indexOf(second)
          );
      }
    });
  }, [availableOnly, category, featuredOnly, products, search, sortOrder, wishlist, wishlistOnly]);

  return (
    <div className="product-browser">
      {!featuredOnly ? (
        <>
        <div className="catalogue-search">
          <label htmlFor="product-search">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle
                cx="10.8"
                cy="10.8"
                r="6.8"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="m16 16 4 4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
            <span className="sr-only">Search products</span>
          </label>
          <input
            autoComplete="off"
            id="product-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search pieces, colours, or materials"
            type="search"
            value={search}
          />
          {search ? (
            <button
              aria-label="Clear product search"
              className="search-clear"
              onClick={() => setSearch("")}
              type="button"
            >
              Clear
            </button>
          ) : null}
        </div>
        <div
          aria-label="Filter products by category"
          className="category-filters"
        >
          <button
            aria-pressed={category === "All"}
            className={`category-filter${category === "All" ? " is-active" : ""}`}
            onClick={() => setCategory("All")}
            type="button"
          >
            All pieces
          </button>
          {categories.map((categoryItem) => (
            <button
              aria-pressed={category === categoryItem.name}
              className={`category-filter${category === categoryItem.name ? " is-active" : ""}`}
              key={categoryItem.id}
              onClick={() => setCategory(categoryItem.name)}
              type="button"
            >
              {categoryItem.name}
            </button>
          ))}
        </div>
        </>
      ) : null}

      <div className="catalogue-toolbar">
        <p aria-live="polite" className="catalogue-count">
          {visibleProducts.length}{" "}
          {visibleProducts.length === 1 ? "piece" : "pieces"}
          {category !== "All" ? ` in ${category}` : ""}
        </p>
        <div className="catalogue-controls">
          <label className="availability-filter">
            <input
              checked={availableOnly}
              onChange={(event) => setAvailableOnly(event.target.checked)}
              type="checkbox"
            />
            <span>Hide sold out</span>
          </label>
          <label className="sort-control">
            <span>Sort by</span>
            <select
              aria-label="Sort products"
              onChange={(event) =>
                setSortOrder(event.target.value as SortOrder)
              }
              value={sortOrder}
            >
              {Object.entries(sortLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {visibleProducts.length > 0 ? (
        <div className="shop-product-grid">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="catalogue-empty">
          <span className="eyebrow">A quiet moment</span>
          <h2 className="section-title">
            {wishlistOnly
              ? "Your saved pieces will feel at home here."
              : "Nothing here just yet."}
          </h2>
          <p>
            {wishlistOnly
              ? "Tap the heart on a piece to keep it close for later."
              : "Try another search or category, or show pieces that are currently sold out."}
          </p>
          {wishlistOnly ? (
            <Link className="button-link" href="/catalogue">
              Explore the catalogue
            </Link>
          ) : (
            <button
              className="button-link"
              onClick={() => {
                setCategory("All");
                setAvailableOnly(false);
                setSearch("");
              }}
              type="button"
            >
              Show all pieces
            </button>
          )}
        </div>
      )}
    </div>
  );
}

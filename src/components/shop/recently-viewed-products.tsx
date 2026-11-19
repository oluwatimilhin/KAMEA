"use client";

import { useCallback, useSyncExternalStore } from "react";
import ProductCard from "@/components/shop/product-card";
import { useCart } from "@/components/shop/cart-context";
import type { Product } from "@/lib/products";

const RECENTLY_VIEWED_KEY = "kamea-recently-viewed-v1";
const EMPTY_PRODUCT_IDS: string[] = [];
let recentProductIds: string[] = EMPTY_PRODUCT_IDS;
let visibleProductIds: string[] = EMPTY_PRODUCT_IDS;
const listeners = new Set<() => void>();

function updateRecentProductIds(
  productIds: string[],
  visibleIds: string[] = productIds,
) {
  recentProductIds = productIds;
  visibleProductIds = visibleIds.slice(0, 4);
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(
  listener: () => void,
  currentProductId: string,
  productCatalog: Product[],
) {
  listeners.add(listener);
  let previousIds: string[] = recentProductIds.filter(
    (id) => id !== currentProductId,
  );

  try {
    const saved = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed)) {
        throw new Error("Saved recently viewed products are not a list.");
      }
      previousIds = parsed.filter(
        (id): id is string =>
          typeof id === "string" &&
          id !== currentProductId &&
          productCatalog.some((product) => product.id === id),
      );
    }

    const updatedIds = [
      currentProductId,
      ...previousIds.filter((id) => id !== currentProductId),
    ].slice(0, 8);
    updateRecentProductIds(updatedIds, previousIds);
    window.localStorage.setItem(
      RECENTLY_VIEWED_KEY,
      JSON.stringify(recentProductIds),
    );
  } catch (error) {
    console.error("Could not update recently viewed KAMEA products.", error);
    updateRecentProductIds(previousIds.slice(0, 8));
  }

  function handleStorage(event: StorageEvent) {
    if (event.key !== RECENTLY_VIEWED_KEY) {
      return;
    }

    try {
      const parsed: unknown = event.newValue ? JSON.parse(event.newValue) : [];
      if (!Array.isArray(parsed)) {
        throw new Error("Updated recently viewed products are not a list.");
      }
      const updatedIds = parsed.filter(
        (id): id is string =>
          typeof id === "string" &&
          id !== currentProductId &&
          productCatalog.some((product) => product.id === id),
      );
      updateRecentProductIds(updatedIds, updatedIds);
      notifyListeners();
    } catch (error) {
      console.error("Could not read updated recently viewed products.", error);
    }
  }

  window.addEventListener("storage", handleStorage);
  listener();

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function getSnapshot() {
  return visibleProductIds;
}

function getServerSnapshot() {
  return EMPTY_PRODUCT_IDS;
}

export default function RecentlyViewedProducts({
  currentProductId,
}: {
  currentProductId: string;
}) {
  const { products } = useCart();
  const subscribeToProduct = useCallback(
    (listener: () => void) =>
      subscribe(listener, currentProductId, products),
    [currentProductId, products],
  );
  const viewedProductIds = useSyncExternalStore(
    subscribeToProduct,
    getSnapshot,
    getServerSnapshot,
  );

  const recentProducts = viewedProductIds.flatMap((id) => {
    const product = products.find((entry) => entry.id === id);
    return product ? [product] : [];
  });

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="recently-viewed-title"
      className="section recently-viewed-section"
    >
      <div className="section-inner">
        <div className="section-heading">
          <div>
            <span className="eyebrow">A little browsing history</span>
            <h2 className="section-title" id="recently-viewed-title">
              Recently <em>viewed.</em>
            </h2>
          </div>
        </div>
        <div className="shop-product-grid related-product-grid">
          {recentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

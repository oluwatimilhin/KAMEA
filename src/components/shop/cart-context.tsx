"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import {
  productCategories,
  products as sampleProducts,
  getProductAvailability,
  type Product,
  type StoreCategory,
} from "@/lib/products";

const STORAGE_KEY = "kamea-shop-state-v1";

export type CartLine = {
  productId: string;
  quantity: number;
  colour: string;
  size: string;
};

type SavedShopState = {
  cart: CartLine[];
  wishlist: string[];
};

type CartContextValue = SavedShopState & {
  products: Product[];
  categories: StoreCategory[];
  isHydrated: boolean;
  itemCount: number;
  addItem: (
    productId: string,
    quantity: number,
    colour: string,
    size: string,
  ) => void;
  setItemQuantity: (
    productId: string,
    colour: string,
    size: string,
    quantity: number,
  ) => void;
  removeItem: (productId: string, colour: string, size: string) => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const EMPTY_STATE: SavedShopState = { cart: [], wishlist: [] };
let savedState = EMPTY_STATE;
let isStoreInitialized = false;
let knownProducts = sampleProducts;
const listeners = new Set<() => void>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readSavedState(
  serialized: string | null,
  productCatalog: Product[],
): SavedShopState {
  if (!serialized) {
    return { cart: [], wishlist: [] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch (error) {
    console.error("Could not read saved KAMEA shopping data.", error);
    return { cart: [], wishlist: [] };
  }

  if (
    !isRecord(parsed) ||
    !Array.isArray(parsed.cart) ||
    !Array.isArray(parsed.wishlist)
  ) {
    console.error("Saved KAMEA shopping data has an invalid format.");
    return { cart: [], wishlist: [] };
  }

  const knownProductIds = new Map(
    productCatalog.map((product) => [product.id, product]),
  );
  const cart = parsed.cart.flatMap((entry): CartLine[] => {
    if (
      !isRecord(entry) ||
      typeof entry.productId !== "string" ||
      typeof entry.colour !== "string" ||
      typeof entry.size !== "string" ||
      typeof entry.quantity !== "number" ||
      !Number.isSafeInteger(entry.quantity) ||
      entry.quantity < 1
    ) {
      return [];
    }

    const product = knownProductIds.get(entry.productId);
    if (
      !product ||
      product.availability === "Sold out" ||
      getProductAvailability(
        product,
        entry.colour,
        entry.size,
      ) === "Sold out" ||
      !product.colours.includes(entry.colour) ||
      !product.sizes.includes(entry.size)
    ) {
      return [];
    }

    return [
      {
        productId: entry.productId,
        quantity: entry.quantity,
        colour: entry.colour,
        size: entry.size,
      },
    ];
  });

  const wishlist = [
    ...new Set(
      parsed.wishlist.filter(
        (id): id is string =>
          typeof id === "string" && knownProductIds.has(id),
      ),
    ),
  ];

  return { cart, wishlist };
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function initializeStore(productCatalog: Product[]) {
  if (isStoreInitialized) {
    return;
  }

  knownProducts = productCatalog;
  try {
    savedState = readSavedState(
      window.localStorage.getItem(STORAGE_KEY),
      knownProducts,
    );
  } catch (error) {
    console.error("Could not access saved KAMEA shopping data.", error);
    savedState = EMPTY_STATE;
  } finally {
    isStoreInitialized = true;
  }
}

function persistStore() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
  } catch (error) {
    console.error("Could not save KAMEA shopping data.", error);
  }
}

function updateStore(updater: (current: SavedShopState) => SavedShopState) {
  initializeStore(knownProducts);
  savedState = updater(savedState);
  persistStore();
  notifyListeners();
}

function subscribe(listener: () => void, productCatalog: Product[]) {
  listeners.add(listener);
  knownProducts = productCatalog;
  initializeStore(productCatalog);
  listener();

  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) {
      try {
        savedState = readSavedState(event.newValue, knownProducts);
        notifyListeners();
      } catch (error) {
        console.error("Could not read updated KAMEA shopping data.", error);
      }
    }
  }

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function getSnapshot() {
  return savedState;
}

function getServerSnapshot() {
  return EMPTY_STATE;
}

export function CartProvider({
  children,
  products: productCatalog = sampleProducts,
  categories = productCategories.map((category, index) => ({
    id: category.name.toLowerCase().replaceAll(" ", "-"),
    slug: category.name.toLowerCase().replaceAll(" ", "-"),
    name: category.name,
    description: category.description,
    image: category.image,
    sortOrder: index,
  })),
}: {
  children: ReactNode;
  products?: Product[];
  categories?: StoreCategory[];
}) {
  const subscribeToStore = useCallback(
    (listener: () => void) => subscribe(listener, productCatalog),
    [productCatalog],
  );

  const savedShopState = useSyncExternalStore(
    subscribeToStore,
    getSnapshot,
    getServerSnapshot,
  );
  const isHydrated = isStoreInitialized;

  function addItem(
    productId: string,
    quantity: number,
    colour: string,
    size: string,
  ) {
    const product = productCatalog.find((entry) => entry.id === productId);
    if (
      !product ||
      product.availability === "Sold out" ||
      getProductAvailability(product, colour, size) === "Sold out" ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      !product.colours.includes(colour) ||
      !product.sizes.includes(size)
    ) {
      return;
    }

    updateStore((current) => {
      const existing = current.cart.find(
        (item) =>
          item.productId === productId &&
          item.colour === colour &&
          item.size === size,
      );
      const cart = existing
        ? current.cart.map((item) =>
            item.productId === productId &&
            item.colour === colour &&
            item.size === size
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        : [...current.cart, { productId, quantity, colour, size }];

      return { ...current, cart };
    });
  }

  function setItemQuantity(
    productId: string,
    colour: string,
    size: string,
    quantity: number,
  ) {
    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      return;
    }

    updateStore((current) => ({
      ...current,
      cart: current.cart.map((item) =>
        item.productId === productId &&
        item.colour === colour &&
        item.size === size
          ? { ...item, quantity }
          : item,
      ),
    }));
  }

  function removeItem(productId: string, colour: string, size: string) {
    updateStore((current) => ({
      ...current,
      cart: current.cart.filter(
        (item) =>
          item.productId !== productId ||
          item.colour !== colour ||
          item.size !== size,
      ),
    }));
  }

  function toggleWishlist(productId: string) {
    if (!productCatalog.some((product) => product.id === productId)) {
      return;
    }

    updateStore((current) => ({
      ...current,
      wishlist: current.wishlist.includes(productId)
        ? current.wishlist.filter((id) => id !== productId)
        : [...current.wishlist, productId],
    }));
  }

  const value: CartContextValue = {
    ...savedShopState,
    products: productCatalog,
    categories,
    isHydrated,
    itemCount: savedShopState.cart.reduce(
      (total, item) => total + item.quantity,
      0,
    ),
    addItem,
    setItemQuantity,
    removeItem,
    toggleWishlist,
    isWishlisted: (productId) => savedShopState.wishlist.includes(productId),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return context;
}

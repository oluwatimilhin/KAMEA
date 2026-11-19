import type { Metadata } from "next";
import { CartProvider } from "@/components/shop/cart-context";
import { getStoreCategories, getStoreProducts } from "@/lib/supabase/public-catalogue";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KAMEA — Handmade, Kept Forever",
    template: "%s | KAMEA",
  },
  description:
    "Discover timeless, one-of-a-kind crochet pieces, thoughtfully made by hand by KAMEA.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [products, categories] = await Promise.all([
    getStoreProducts(),
    getStoreCategories(),
  ]);

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <CartProvider products={products} categories={categories}>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

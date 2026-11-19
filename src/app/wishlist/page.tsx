import type { Metadata } from "next";
import Link from "next/link";
import ProductBrowser from "@/components/shop/product-browser";
import SiteFooter from "@/components/layout/site-footer";
import SiteHeader from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Your Wishlist",
  description:
    "Keep your favourite KAMEA handmade crochet pieces close and return to them whenever you like.",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return (
    <>
      <div className="announcement">
        Small-batch crochet · Made slowly, with intention
      </div>
      <SiteHeader />
      <main>
        <section aria-labelledby="wishlist-title" className="catalogue-hero">
          <span className="eyebrow">Saved for a little later</span>
          <h1 className="shop-page-title" id="wishlist-title">
            Pieces to <em>keep close.</em>
          </h1>
          <p>
            Your favourite handmade pieces, saved on this browser. No account
            needed.
          </p>
        </section>
        <section
          aria-label="Your saved KAMEA products"
          className="section catalogue-section"
        >
          <div className="section-inner">
            <ProductBrowser wishlistOnly />
            <p className="wishlist-browse-link">
              Looking for something new? <Link href="/catalogue">Explore the catalogue.</Link>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

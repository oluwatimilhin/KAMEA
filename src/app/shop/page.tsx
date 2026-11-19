import type { Metadata } from "next";
import Link from "next/link";
import ProductBrowser from "@/components/shop/product-browser";
import SiteFooter from "@/components/layout/site-footer";
import SiteHeader from "@/components/layout/site-header";
import { getStoreCategories } from "@/lib/supabase/public-catalogue";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Shop KAMEA's small-batch handmade crochet bags, clothing, accessories, home décor, and custom pieces.",
};

export default async function ShopPage() {
  const productCategories = await getStoreCategories();
  return (
    <>
      <div className="announcement">
        Small-batch crochet · Made slowly, with intention
      </div>
      <SiteHeader />
      <main>
        <section aria-labelledby="shop-title" className="shop-hero">
          <span className="eyebrow">The KAMEA collection</span>
          <h1 className="shop-page-title" id="shop-title">
            A little more <em>handmade.</em>
          </h1>
          <p>
            Thoughtful crochet pieces, made one stitch at a time. Find
            something for your everyday, your home, or someone you love.
          </p>
          <Link className="button-link" href="#shop-categories">
            Explore the collection
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M3.5 10h12m-5-5 5 5-5 5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.25"
              />
            </svg>
          </Link>
        </section>

        <section
          aria-labelledby="shop-categories-title"
          className="section shop-categories-section"
          id="shop-categories"
        >
          <div className="section-inner">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Find your kind of lovely</span>
                <h2 className="section-title" id="shop-categories-title">
                  Shop by <em>collection.</em>
                </h2>
              </div>
              <Link className="text-link" href="/catalogue">
                View the full catalogue
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M3.5 10h12m-5-5 5 5-5 5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.25"
                  />
                </svg>
              </Link>
            </div>
            <div className="shop-category-grid">
              {productCategories.map((category) => (
                <Link
                  className="shop-category-card"
                  href={`/catalogue?category=${encodeURIComponent(category.name)}`}
                  key={category.id}
                >
                  <div
                    aria-label={`${category.name} crochet collection`}
                    className="shop-category-photo"
                    role="img"
                    style={{ backgroundImage: `url("${category.image}")` }}
                  />
                  <span className="shop-category-overlay" />
                  <div className="shop-category-copy">
                    <span>Explore</span>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="shop-favourites-title"
          className="section soft-section"
          id="shop-favourites"
        >
          <div className="section-inner">
            <div className="section-heading">
              <div>
                <span className="eyebrow">A few pieces to begin with</span>
                <h2 className="section-title" id="shop-favourites-title">
                  KAMEA <em>favourites.</em>
                </h2>
                <p className="section-intro">
                  Small-batch pieces, chosen for their thoughtful details and
                  everyday ease.
                </p>
              </div>
              <Link className="text-link" href="/catalogue">
                Browse every piece
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M3.5 10h12m-5-5 5 5-5 5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.25"
                  />
                </svg>
              </Link>
            </div>
            <ProductBrowser featuredOnly />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

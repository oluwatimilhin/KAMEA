import type { Metadata } from "next";
import ProductBrowser from "@/components/shop/product-browser";
import SiteFooter from "@/components/layout/site-footer";
import SiteHeader from "@/components/layout/site-header";
import { getStoreCategories } from "@/lib/supabase/public-catalogue";

export const metadata: Metadata = {
  title: "Catalogue",
  description:
    "Explore the complete KAMEA crochet catalogue. Filter handmade bags, clothing, accessories, home décor, and custom crochet.",
};

type CataloguePageProps = {
  searchParams: Promise<{ category?: string | string[] }>;
};

export default async function CataloguePage({
  searchParams,
}: CataloguePageProps) {
  const params = await searchParams;
  const categories = await getStoreCategories();
  const requestedCategory = Array.isArray(params.category)
    ? params.category[0]
    : params.category;
  const initialCategory =
    requestedCategory && categories.some((category) => category.name === requestedCategory)
      ? requestedCategory
      : "All";

  return (
    <>
      <div className="announcement">
        Small-batch crochet · Made slowly, with intention
      </div>
      <SiteHeader />
      <main>
        <section aria-labelledby="catalogue-title" className="catalogue-hero">
          <span className="eyebrow">The complete collection</span>
          <h1 className="shop-page-title" id="catalogue-title">
            Pieces made with <em>meaning.</em>
          </h1>
          <p>
            Browse the KAMEA catalogue—from everyday favourites to one-of-a-kind
            commissions, each thoughtfully crocheted by hand.
          </p>
        </section>

        <section
          aria-label="KAMEA crochet catalogue"
          className="section catalogue-section"
          id="products"
        >
          <div className="section-inner">
            <ProductBrowser initialCategory={initialCategory} />
            <p className="catalogue-note">
              Prices are shown in Ghanaian cedis (GHS). Made-to-order pieces
              are created especially for you; availability may change.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

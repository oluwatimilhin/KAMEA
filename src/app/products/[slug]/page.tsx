import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/shop/product-card";
import ProductDetails from "@/components/shop/product-details";
import RecentlyViewedProducts from "@/components/shop/recently-viewed-products";
import SiteFooter from "@/components/layout/site-footer";
import SiteHeader from "@/components/layout/site-header";
import { getStoreProducts } from "@/lib/supabase/public-catalogue";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await getStoreProducts();
  return products.map((product) => ({ slug: product.id }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const products = await getStoreProducts();
  const product = products.find((entry) => entry.id === slug);

  if (!product) {
    return { title: "Piece not found" };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | KAMEA`,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const products = await getStoreProducts();
  const product = products.find((entry) => entry.id === slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = products
    .filter((item) => item.id !== product.id)
    .sort((first, second) => {
      const firstCategoryMatch = first.category === product.category ? 1 : 0;
      const secondCategoryMatch = second.category === product.category ? 1 : 0;
      if (firstCategoryMatch !== secondCategoryMatch) {
        return secondCategoryMatch - firstCategoryMatch;
      }

      const firstAvailable = first.availability === "Sold out" ? 0 : 1;
      const secondAvailable = second.availability === "Sold out" ? 0 : 1;
      if (firstAvailable !== secondAvailable) {
        return secondAvailable - firstAvailable;
      }

      return (
        Math.abs(first.price - product.price) -
        Math.abs(second.price - product.price)
      );
    })
    .slice(0, 4);

  return (
    <>
      <div className="announcement">
        Small-batch crochet · Made slowly, with intention
      </div>
      <SiteHeader />
      <main>
        <section
          aria-label={`${product.name} product details`}
          className="section product-detail-section"
        >
          <div className="section-inner">
            <ProductDetails product={product} />
          </div>
        </section>

        {relatedProducts.length > 0 ? (
          <section
            aria-labelledby="related-products-title"
            className="section soft-section"
          >
            <div className="section-inner">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Picked to complement your choice</span>
                  <h2 className="section-title" id="related-products-title">
                    You may also <em>adore.</em>
                  </h2>
                </div>
                <Link
                  className="text-link"
                  href={`/catalogue?category=${encodeURIComponent(product.category)}`}
                >
                  More in {product.category}
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
              <div className="shop-product-grid related-product-grid">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}
        <RecentlyViewedProducts currentProductId={product.id} />
      </main>
      <SiteFooter />
    </>
  );
}

import Link from "next/link";
import NewsletterForm from "@/components/home/newsletter-form";
import SectionHeading from "@/components/home/section-heading";
import SiteFooter from "@/components/layout/site-footer";
import SiteHeader from "@/components/layout/site-header";
import ProductCard from "@/components/shop/product-card";
import {
  collections,
  craftImage,
  heroImage,
  instagramImages,
  newArrival,
  storyImage,
  testimonials,
  values,
} from "@/lib/homepage-data";
import { getStoreProducts } from "@/lib/supabase/public-catalogue";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3.5 10h12m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.25"
      />
    </svg>
  );
}

function Photo({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      aria-label={alt}
      className={`photo ${className ?? ""}`}
      role="img"
      style={{ backgroundImage: `url("${src}")` }}
    />
  );
}

export default async function Home() {
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
  const storeProducts = await getStoreProducts();

  return (
    <>
      <div className="announcement">
        Small-batch crochet · Made slowly, with intention
      </div>
      <SiteHeader />
      <main>
        <section aria-labelledby="hero-title" className="hero">
          <div className="hero-copy">
            <span className="eyebrow">The art of taking it slow</span>
            <h1 id="hero-title">
              Made by hand.
              <br />
              <em>Meant to be kept.</em>
            </h1>
            <p className="hero-description">
              One thoughtful stitch at a time, we create crochet pieces that
              bring warmth, character, and a little everyday wonder.
            </p>
            <Link className="button-link" href="#collections">
              Discover the collection <ArrowIcon />
            </Link>
            <div className="hero-note">A slower kind of beautiful</div>
          </div>
          <div className="hero-photo-wrap">
            <Photo
              alt="A close view of softly textured handmade crochet"
              className="hero-photo"
              src={heroImage}
            />
            <div className="hero-photo-caption">
              Made with care, just for you
            </div>
          </div>
        </section>

        <section
          aria-labelledby="collections-title"
          className="section"
          id="collections"
        >
          <div className="section-inner">
            <SectionHeading
              eyebrow="Featured collections"
              id="collections-title"
              title={
                <>
                  Little things, <em>made lovely.</em>
                </>
              }
              description="Thoughtful textures and timeless shapes, made slowly and designed to be part of your everyday."
            />
            <div className="collection-grid">
              {collections.map((collection) => (
                <Link
                  aria-label={`Explore ${collection.title}`}
                  className="collection-card"
                  href="#best-sellers"
                  key={collection.title}
                >
                  <Photo
                    alt={collection.alt}
                    className=""
                    src={collection.image}
                  />
                  <div className="collection-copy">
                    <span>{collection.detail}</span>
                    <h3>{collection.title}</h3>
                    <p>{collection.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="bestsellers-title"
          className="section soft-section"
          id="best-sellers"
        >
          <div className="section-inner">
            <SectionHeading
              eyebrow="Best sellers · Beloved, for a reason"
              id="bestsellers-title"
              title={
                <>
                  The <em>favourites.</em>
                </>
              }
              description="A few pieces our community reaches for, gifts with love, and keeps close."
              link={{ href: "#new-arrivals", label: "Meet the collection" }}
            />
            <div className="product-grid">
              {storeProducts
                .filter((product) => product.featured)
                .slice(0, 4)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="new-arrivals-title"
          className="section"
          id="new-arrivals"
        >
          <div className="section-inner arrival-panel">
            <Photo
              alt={newArrival.alt}
              className="arrival-photo"
              src={newArrival.image}
            />
            <div className="arrival-copy">
              <span className="eyebrow">New arrivals · Just off the hook</span>
              <h2 className="section-title" id="new-arrivals-title">
                A fresh little <em>chapter.</em>
              </h2>
              <p>
                Meet the pieces we have been making lately: soft textures,
                warm neutrals, and small details that make them entirely their
                own. Each one is made in a limited run, so no two are quite
                alike.
              </p>
              <Link className="text-link" href="#newsletter">
                Be first to hear <ArrowIcon />
              </Link>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="story-title"
          className="section soft-section"
          id="story"
        >
          <div className="section-inner story-layout">
            <div className="story-photo-wrap">
              <Photo
                alt="Hands and yarn coming together in a handmade crochet piece"
                className="story-photo"
                src={storyImage}
              />
              <div aria-hidden="true" className="story-stamp">
                A little
                <br />
                more meaning
              </div>
            </div>
            <div className="story-copy">
              <span className="eyebrow">About KAMEA</span>
              <h2 className="story-title" id="story-title">
                A little more <em>meaning.</em>
              </h2>
              <p>
                KAMEA began with a simple belief: the things we live with
                should feel personal. Not hurried, not mass-made—just
                thoughtfully created by hand, with room for the little
                imperfections that make each piece special.
              </p>
              <p>
                We work in small batches, choose our materials with care, and
                make every stitch count. The result is a collection meant to be
                reached for, lived in, and loved for a long time.
              </p>
              <Link className="text-link" href="/about">
                Read more about KAMEA <ArrowIcon />
              </Link>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="values-title"
          className="section"
          id="why-kamea"
        >
          <div className="section-inner">
            <SectionHeading
              centered
              eyebrow="Why choose KAMEA"
              id="values-title"
              title={
                <>
                  Made with <em>intention.</em>
                </>
              }
              description="A little more care goes into every KAMEA piece—and you can feel it."
            />
            <div className="values-grid">
              {values.map((value) => (
                <article className="value-card" key={value.title}>
                  <span aria-hidden="true" className="value-icon">
                    {value.icon === "heart" ? (
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M20.8 8.7c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10a4.7 4.7 0 0 1 8.8-2.2 4.7 4.7 0 0 1 8.8 2.2Z"
                          stroke="currentColor"
                          strokeLinejoin="round"
                          strokeWidth="1.4"
                        />
                      </svg>
                    ) : value.icon === "leaf" ? (
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M19.5 4.5c-8.4 0-13 3.1-13 8.2a5.8 5.8 0 0 0 5.8 5.8c5.1 0 7.2-5.6 7.2-14Z"
                          stroke="currentColor"
                          strokeLinejoin="round"
                          strokeWidth="1.4"
                        />
                        <path
                          d="M4.5 20c2.4-4.8 5.7-7.5 10-9.5"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="1.4"
                        />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M4 8.2 12 4l8 4.2v7.6L12 20l-8-4.2V8.2Z"
                          stroke="currentColor"
                          strokeLinejoin="round"
                          strokeWidth="1.4"
                        />
                        <path
                          d="m4.5 8.5 7.5 4 7.5-4M12 12.5V20"
                          stroke="currentColor"
                          strokeLinejoin="round"
                          strokeWidth="1.4"
                        />
                      </svg>
                    )}
                  </span>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="craft-title"
          className="craft-section"
          id="craftsmanship"
        >
          <Photo
            alt="Natural yarn and tactile crochet details in warm light"
            className="craft-photo"
            src={craftImage}
          />
          <div className="craft-copy">
            <span className="eyebrow">Handmade craftsmanship</span>
            <h2 className="section-title" id="craft-title">
              Every stitch has <em>a story.</em>
            </h2>
            <p>
              From the first loop to the final finishing touch, each piece
              passes through thoughtful hands. Crochet asks us to slow down,
              pay attention, and find beauty in the details—exactly the spirit
              we hope you feel in every KAMEA creation.
            </p>
            <Link className="text-link" href="#story">
              Get to know our craft <ArrowIcon />
            </Link>
          </div>
        </section>

        <section
          aria-labelledby="testimonials-title"
          className="section soft-section"
          id="kind-words"
        >
          <div className="section-inner">
            <SectionHeading
              centered
              eyebrow="Customer testimonials"
              id="testimonials-title"
              title={
                <>
                  Kind words, <em>kept close.</em>
                </>
              }
            />
            <div className="testimonial-grid">
              {testimonials.map((testimonial) => (
                <figure className="testimonial-card" key={testimonial.name}>
                  <div className="testimonial-stars">
                    <span className="sr-only">Customer testimonial placeholder</span>
                    <span aria-hidden="true">★★★★★</span>
                  </div>
                  <blockquote className="testimonial-quote">
                    “{testimonial.quote}”
                  </blockquote>
                  <figcaption className="testimonial-author">
                    {testimonial.name}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="instagram-title"
          className="section"
          id="instagram"
        >
          <div className="section-inner">
            <div className="instagram-heading">
              <span className="eyebrow">Instagram gallery</span>
              <h2 className="section-title" id="instagram-title">
                In good company, <em>with KAMEA.</em>
              </h2>
            </div>
            <div className="instagram-grid">
              {instagramImages.map((image, index) => {
                const cardContent = (
                  <>
                    <Photo
                      alt={image.alt}
                      className="instagram-photo"
                      src={image.src}
                    />
                    <span aria-hidden="true" className="instagram-overlay">
                      {instagramUrl
                        ? "Follow along"
                        : "Instagram account coming soon"}
                    </span>
                  </>
                );

                return instagramUrl ? (
                  <a
                    aria-label={`Visit KAMEA on Instagram, image ${index + 1}`}
                    className="instagram-card"
                    href={instagramUrl}
                    key={`${image.src}-${index}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {cardContent}
                  </a>
                ) : (
                  <div
                    aria-label={`KAMEA Instagram gallery image ${index + 1}; account link coming soon`}
                    className="instagram-card"
                    key={`${image.src}-${index}`}
                  >
                    {cardContent}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="newsletter-title"
          className="newsletter-section"
          id="newsletter"
        >
          <div className="newsletter-layout">
            <div className="newsletter-copy">
              <span className="eyebrow">The KAMEA newsletter</span>
              <h2 className="newsletter-title" id="newsletter-title">
                Stay for the <em>little things.</em>
              </h2>
              <p>
                New pieces, small stories, and the occasional note from our
                workroom. Never too much, always made with care.
              </p>
              <p className="newsletter-privacy-note">
                Sign up for occasional KAMEA updates. Your email is sent to our
                newsletter provider once one is connected.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

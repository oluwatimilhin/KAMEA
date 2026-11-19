import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/layout/site-footer";
import SiteHeader from "@/components/layout/site-header";
import { craftImage, storyImage } from "@/lib/homepage-data";

export const metadata: Metadata = {
  title: "About KAMEA",
  description:
    "Discover KAMEA's thoughtful approach to handmade crochet and slow, considered design.",
};

export default function AboutPage() {
  return (
    <>
      <div className="announcement">
        Small-batch crochet · Made slowly, with intention
      </div>
      <SiteHeader />
      <main className="editorial-page">
        <section className="editorial-hero section-inner">
          <p className="eyebrow">Our story</p>
          <h1>
            Made by hand.
            <br />
            <em>Meant to be kept.</em>
          </h1>
          <p>
            KAMEA is a handmade crochet brand built around a simple idea: the
            things we carry, wear, and live with can feel a little more
            personal.
          </p>
        </section>
        <section className="editorial-story soft-section">
          <div className="section-inner editorial-story-grid">
            <div
              aria-label="Handmade crochet textures in warm, natural tones"
              className="editorial-photo"
              role="img"
              style={{ backgroundImage: `url("${storyImage}")` }}
            />
            <div className="editorial-copy">
              <span className="eyebrow">Thoughtfully made</span>
              <h2 className="section-title">
                A little more <em>meaning.</em>
              </h2>
              <p>
                We make crochet pieces one stitch at a time, with an
                appreciation for texture, useful details, and the character
                that comes from work made by hand. Our collections are
                intentionally considered rather than mass-produced.
              </p>
              <p>
                We believe handmade objects deserve to be used, cared for, and
                kept close. Each KAMEA piece is an invitation to slow down and
                find beauty in the everyday.
              </p>
              <Link className="text-link" href="/catalogue">
                Explore the collection
              </Link>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="section-inner editorial-story-grid editorial-story-reverse">
            <div className="editorial-copy">
              <span className="eyebrow">The craft</span>
              <h2 className="section-title">
                Every stitch, <em>with intention.</em>
              </h2>
              <p>
                Crochet gives us room to work slowly, pay attention, and let
                the material guide the finished piece. From the first loop to
                the final finishing touch, each creation reflects the care
                behind its making.
              </p>
              <p>
                Some pieces are ready to find a home; others are made to order.
                If you have an idea of your own, we would love to hear what
                you have in mind.
              </p>
              <Link className="text-link" href="/contact#custom-request">
                Talk to us about a custom piece
              </Link>
            </div>
            <div
              aria-label="Yarn and crochet details in warm natural light"
              className="editorial-photo"
              role="img"
              style={{ backgroundImage: `url("${craftImage}")` }}
            />
          </div>
        </section>
        <section className="editorial-values soft-section">
          <div className="section-inner">
            <p className="eyebrow">What matters to us</p>
            <h2 className="section-title">
              A slower kind of <em>beautiful.</em>
            </h2>
            <div className="editorial-values-grid">
              <article>
                <h3>Made with care</h3>
                <p>Time, attention, and thoughtful finishing in every piece.</p>
              </article>
              <article>
                <h3>Made to be lived in</h3>
                <p>Useful, personal pieces for everyday moments and rituals.</p>
              </article>
              <article>
                <h3>Made together</h3>
                <p>
                  A conversation with you helps us understand what you are
                  looking for.
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

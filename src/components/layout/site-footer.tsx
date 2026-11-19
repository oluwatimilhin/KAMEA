import Link from "next/link";
import BrandLogo from "@/components/layout/brand-logo";

const footerLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "About KAMEA", href: "/about" },
  { label: "Ordering information", href: "/ordering-information" },
  { label: "Contact & custom requests", href: "/contact" },
];

export default function SiteFooter() {
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL;

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-main">
          <div className="footer-brand">
            <Link aria-label="KAMEA home" className="brand-logo" href="/">
              <BrandLogo />
            </Link>
            <p>Made with patience. Meant to be part of your story.</p>
          </div>
          <div>
            <h2 className="footer-heading">Explore</h2>
            <div className="footer-links">
              {footerLinks.map((link) => (
                <Link className="footer-link" href={link.href} key={link.label}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="footer-heading">Follow along</h2>
            <div className="footer-links">
              {instagramUrl ? (
                <a
                  className="footer-link"
                  href={instagramUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Instagram
                </a>
              ) : (
                <span className="footer-link footer-link-placeholder">
                  Instagram account to be provided
                </span>
              )}
              <Link className="footer-link" href="/#newsletter">
                Notes from KAMEA
              </Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} KAMEA. Made with care.</span>
          <span>Handmade, in every sense.</span>
        </div>
      </div>
    </footer>
  );
}

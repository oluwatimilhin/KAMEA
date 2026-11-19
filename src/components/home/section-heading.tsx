import Link from "next/link";

type SectionHeadingProps = {
  eyebrow: string;
  id: string;
  title: React.ReactNode;
  description?: string;
  link?: {
    href: string;
    label: string;
  };
  centered?: boolean;
};

export default function SectionHeading({
  eyebrow,
  id,
  title,
  description,
  link,
  centered = false,
}: SectionHeadingProps) {
  return (
    <div className={`section-heading${centered ? " centered" : ""}`}>
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="section-title" id={id}>
          {title}
        </h2>
        {description ? <p className="section-intro">{description}</p> : null}
      </div>
      {link ? (
        <Link className="text-link" href={link.href}>
          {link.label}
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
      ) : null}
    </div>
  );
}

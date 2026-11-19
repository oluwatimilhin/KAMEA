import Image from "next/image";

export default function BrandLogo() {
  return (
    <span aria-hidden="true" className="brand-logo-frame">
      <Image
        alt=""
        className="brand-logo-artwork"
        height={1280}
        priority
        src="/kamea-logo.svg"
        width={1280}
      />
    </span>
  );
}

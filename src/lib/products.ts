export const productCategories = [
  {
    name: "Bags",
    description: "Carry something made just for you.",
    image:
      "https://images.unsplash.com/photo-1594638963668-52eb9798e8ca?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Clothing",
    description: "Wearable layers, made slowly.",
    image:
      "https://images.unsplash.com/photo-1679847628912-4c3e7402abc7?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Accessories",
    description: "Small details with a handmade touch.",
    image:
      "https://images.unsplash.com/photo-1668072587859-f0f30c8fa938?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Home Décor",
    description: "Soft textures for slower moments.",
    image:
      "https://images.unsplash.com/photo-1728393287642-13bee7126ae8?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Custom Crochet",
    description: "A one-of-a-kind piece, made with you.",
    image:
      "https://images.unsplash.com/photo-1620633437938-be73c35eb77e?auto=format&fit=crop&w=900&q=85",
  },
] as const;

export type ProductCategory = string;
export type StoreCategory = {
  id: string;
  slug: string;
  name: ProductCategory;
  description: string;
  image: string;
  sortOrder: number;
};
export type ProductAvailability = "In stock" | "Made to order" | "Sold out";
export type ProductVariant = {
  colour: string;
  size: string;
  availability: ProductAvailability;
};

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  availability: ProductAvailability;
  image: string;
  imageAlt: string;
  galleryImages: { src: string; alt: string }[];
  colours: string[];
  sizes: string[];
  variants?: ProductVariant[];
  materials: string[];
  details: string[];
  featured?: boolean;
  isNew?: boolean;
};

export function getProductAvailability(
  product: Product,
  colour: string,
  size: string,
): ProductAvailability {
  if (product.availability === "Sold out") {
    return "Sold out";
  }

  return (
    product.variants?.find(
      (variant) => variant.colour === colour && variant.size === size,
    )?.availability ?? product.availability
  );
}

const bagImage =
  "https://images.unsplash.com/photo-1594638963668-52eb9798e8ca?auto=format&fit=crop&w=1000&q=85";
const clothingImage =
  "https://images.unsplash.com/photo-1679847628912-4c3e7402abc7?auto=format&fit=crop&w=1000&q=85";
const yarnImage =
  "https://images.unsplash.com/photo-1668072587859-f0f30c8fa938?auto=format&fit=crop&w=1000&q=85";
const homeImage =
  "https://images.unsplash.com/photo-1728393287642-13bee7126ae8?auto=format&fit=crop&w=1000&q=85";
const stitchImage =
  "https://images.unsplash.com/photo-1620633437938-be73c35eb77e?auto=format&fit=crop&w=1000&q=85";

export const products: Product[] = [
  {
    id: "sunday-market-tote",
    name: "Sunday Market Tote",
    category: "Bags",
    description:
      "A roomy, hand-crocheted carryall for market mornings and everyday errands.",
    price: 680,
    availability: "In stock",
    image: bagImage,
    imageAlt: "Textured handmade tote in warm natural tones",
    galleryImages: [
      { src: bagImage, alt: "The Sunday Market Tote in warm natural tones" },
      {
        src: stitchImage,
        alt: "Close-up of the Sunday Market Tote crochet stitches",
      },
      { src: yarnImage, alt: "Natural yarn used to inspire the tote palette" },
    ],
    colours: ["Oat", "Cocoa", "Olive"],
    sizes: ["One size"],
    materials: ["100% cotton yarn", "Cotton lining"],
    details: ["Hand-crocheted in small batches", "Soft-lined interior", "Spot clean gently"],
    featured: true,
  },
  {
    id: "everyday-crochet-pouch",
    name: "Everyday Crochet Pouch",
    category: "Bags",
    description:
      "A soft-lined little pouch for the small things you like to keep close.",
    price: 320,
    availability: "Made to order",
    image: stitchImage,
    imageAlt: "Close view of a handmade crochet accessory",
    galleryImages: [
      { src: stitchImage, alt: "Everyday Crochet Pouch stitch detail" },
      { src: bagImage, alt: "Handmade crochet accessory in a natural palette" },
      { src: yarnImage, alt: "Soft yarn chosen for the Everyday Crochet Pouch" },
    ],
    colours: ["Oat", "Rose", "Cocoa"],
    sizes: ["Small", "Medium"],
    materials: ["100% cotton yarn", "Cotton lining", "Wooden button"],
    details: ["Made to order in our workroom", "Hand-finished button closure", "Allow 7–10 days for making"],
    isNew: true,
  },
  {
    id: "the-slow-morning-cardigan",
    name: "Slow Morning Cardigan",
    category: "Clothing",
    description:
      "An easy, textured layer, crocheted slowly in a soft, breathable yarn.",
    price: 1450,
    availability: "Made to order",
    image: clothingImage,
    imageAlt: "Handmade crochet clothing in a neutral palette",
    galleryImages: [
      { src: clothingImage, alt: "Slow Morning Cardigan in a soft neutral shade" },
      { src: stitchImage, alt: "Open crochet stitch pattern on the cardigan" },
      { src: yarnImage, alt: "Soft yarn selected for the Slow Morning Cardigan" },
    ],
    colours: ["Oat", "Cocoa", "Terracotta"],
    sizes: ["XS–S", "M–L", "XL–XXL"],
    materials: ["Cotton and linen blend", "Natural corozo buttons"],
    details: ["Relaxed, easy-to-layer fit", "Made to order in our workroom", "Allow 2–3 weeks for making"],
    featured: true,
  },
  {
    id: "heirloom-crochet-vest",
    name: "Heirloom Crochet Vest",
    category: "Clothing",
    description:
      "A considered layering piece with an open stitch and a relaxed fit.",
    price: 980,
    availability: "In stock",
    image: yarnImage,
    imageAlt: "Soft yarn and crochet details for a handmade vest",
    galleryImages: [
      { src: yarnImage, alt: "Heirloom Crochet Vest yarn and stitch detail" },
      { src: clothingImage, alt: "Hand-crocheted clothing in a warm neutral shade" },
      { src: stitchImage, alt: "A close look at the vest's open crochet stitches" },
    ],
    colours: ["Natural", "Olive"],
    sizes: ["XS–S", "M–L", "XL–XXL"],
    materials: ["100% cotton yarn"],
    details: ["Open stitch with a relaxed fit", "Hand-finished edges", "Ready to ship"],
    isNew: true,
  },
  {
    id: "soft-days-headband",
    name: "Soft Days Headband",
    category: "Accessories",
    description:
      "A gentle, comfortable headband finished by hand in a versatile neutral.",
    price: 180,
    availability: "In stock",
    image: yarnImage,
    imageAlt: "Warm natural yarn ready to become a crochet accessory",
    galleryImages: [
      { src: yarnImage, alt: "Soft Days Headband in a natural yarn shade" },
      { src: stitchImage, alt: "Close-up of the headband's crochet texture" },
      { src: clothingImage, alt: "Handmade crochet accessory styling inspiration" },
    ],
    colours: ["Oat", "Rose", "Cocoa"],
    sizes: ["One size"],
    materials: ["Soft cotton blend"],
    details: ["Gentle stretch for a comfortable fit", "Handmade in small batches", "Ready to ship"],
  },
  {
    id: "little-cloud-neck-wrap",
    name: "Little Cloud Neck Wrap",
    category: "Accessories",
    description:
      "A softly textured accent that adds a little warmth to cool evenings.",
    price: 360,
    availability: "Sold out",
    image: clothingImage,
    imageAlt: "A handmade wearable crochet piece",
    galleryImages: [
      { src: clothingImage, alt: "Little Cloud Neck Wrap in a soft neutral shade" },
      { src: stitchImage, alt: "Textural stitches on the Little Cloud Neck Wrap" },
      { src: yarnImage, alt: "Yarn inspiration for the neck wrap" },
    ],
    colours: ["Oat", "Cocoa"],
    sizes: ["One size"],
    materials: ["Cotton and wool blend"],
    details: ["Soft, cosy texture", "Currently sold out", "Join us again for the next small batch"],
  },
  {
    id: "slow-living-cushion",
    name: "Slow Living Cushion Cover",
    category: "Home Décor",
    description:
      "A tactile cushion cover with a removable backing for easy care.",
    price: 540,
    availability: "In stock",
    image: homeImage,
    imageAlt: "Handmade crochet textures for a calm home",
    galleryImages: [
      { src: homeImage, alt: "Slow Living Cushion Cover in a calm home setting" },
      { src: stitchImage, alt: "Handmade crochet stitches on the cushion cover" },
      { src: bagImage, alt: "Natural crochet texture and color inspiration" },
    ],
    colours: ["Natural", "Olive", "Cocoa"],
    sizes: ["40 × 40 cm", "50 × 50 cm"],
    materials: ["100% cotton yarn", "Cotton backing"],
    details: ["Removable envelope-style backing", "Cushion insert not included", "Gentle hand wash"],
    featured: true,
  },
  {
    id: "little-heirloom-throw",
    name: "Little Heirloom Throw",
    category: "Home Décor",
    description:
      "A cosy, hand-finished throw made for quiet afternoons at home.",
    price: 1650,
    availability: "Made to order",
    image: stitchImage,
    imageAlt: "Close-up of a warm handmade crochet throw",
    galleryImages: [
      { src: stitchImage, alt: "Little Heirloom Throw crochet texture" },
      { src: homeImage, alt: "Handmade crochet for a cosy home" },
      { src: yarnImage, alt: "Natural yarn for the Little Heirloom Throw" },
    ],
    colours: ["Oat", "Olive", "Cocoa"],
    sizes: ["Baby", "Throw", "Large throw"],
    materials: ["100% cotton yarn"],
    details: ["Made to order in our workroom", "Size and colour affect making time", "Allow 2–4 weeks for making"],
    isNew: true,
  },
  {
    id: "made-for-you-keepsake",
    name: "Made-for-You Keepsake",
    category: "Custom Crochet",
    description:
      "A collaborative custom piece, shaped around your colours and ideas.",
    price: 850,
    availability: "Made to order",
    image: yarnImage,
    imageAlt: "Yarn colours and tools for a custom crochet commission",
    galleryImages: [
      { src: yarnImage, alt: "Colour palette for a custom crochet keepsake" },
      { src: stitchImage, alt: "Handmade crochet detail for a custom keepsake" },
      { src: homeImage, alt: "A made-to-order crochet piece for the home" },
    ],
    colours: ["Choose your colours"],
    sizes: ["Made to your measurements"],
    materials: ["Selected together for your commission"],
    details: ["A KAMEA maker will confirm your design", "Final price depends on size and materials", "Allow 2–4 weeks after design approval"],
    featured: true,
  },
  {
    id: "personalised-home-piece",
    name: "Personalised Home Piece",
    category: "Custom Crochet",
    description:
      "A thoughtful made-to-order home accent, created in a palette you love.",
    price: 720,
    availability: "Made to order",
    image: homeImage,
    imageAlt: "Hand-crocheted home accessory in a soft neutral setting",
    galleryImages: [
      { src: homeImage, alt: "Personalised crochet home piece in a natural setting" },
      { src: stitchImage, alt: "Crochet stitch detail on a custom home piece" },
      { src: yarnImage, alt: "Yarn choices for a personalised crochet commission" },
    ],
    colours: ["Choose your colours"],
    sizes: ["Made to your measurements"],
    materials: ["Selected together for your commission"],
    details: ["Made around your space and ideas", "A KAMEA maker will confirm your design", "Allow 2–4 weeks after design approval"],
    isNew: true,
  },
];

export const productCategoriesList: ProductCategory[] = productCategories.map(
  (category) => category.name,
);

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(price);
}

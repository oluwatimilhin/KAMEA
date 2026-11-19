import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Product, StoreCategory } from "@/lib/products";
import {
  productCategories,
  products as sampleProducts,
} from "@/lib/products";
import type {
  CategoryRow,
  ProductImageRow,
  ProductRow,
  ProductVariantRow,
} from "@/lib/supabase/database.types";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";

export async function getStoreCategories(): Promise<StoreCategory[]> {
  const config = getSupabaseConfig();
  if (!config.configured) {
    return productCategories.map((category, index) => ({
      id: category.name.toLowerCase().replaceAll(" ", "-"),
      slug: category.name.toLowerCase().replaceAll(" ", "-"),
      name: category.name,
      description: category.description,
      image: category.image,
      sortOrder: index,
    }));
  }

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) {
    throw new Error(`Could not load KAMEA categories: ${error.message}`);
  }

  return (data as CategoryRow[]).map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    image: category.image_url ?? "",
    sortOrder: category.sort_order,
  }));
}

export async function getStoreProducts(): Promise<Product[]> {
  const config = getSupabaseConfig();
  if (!config.configured) {
    return sampleProducts;
  }

  const supabase = createPublicSupabaseClient();
  const [
    { data: categoryRows, error: categoryError },
    { data: productRows, error: productError },
    { data: imageRows, error: imageError },
    { data: variantRows, error: variantError },
  ] = await Promise.all([
    supabase.from("categories").select("*").eq("is_active", true),
    supabase
      .from("products")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false }),
    supabase.from("product_images").select("*").order("sort_order"),
    supabase.from("product_variants").select("*"),
  ]);

  const errors = [
    categoryError,
    productError,
    imageError,
    variantError,
  ].filter(Boolean);
  if (errors.length > 0) {
    throw new Error(
      `Could not load the KAMEA catalogue from Supabase: ${errors.map((error) => error?.message).join("; ")}`,
    );
  }

  const categories = categoryRows as CategoryRow[];
  const catalogue = productRows as ProductRow[];
  const images = imageRows as ProductImageRow[];
  const variants = variantRows as ProductVariantRow[];
  const categoriesById = new Map(
    categories.map((category) => [category.id, category]),
  );
  const supabaseCategories = createPublicSupabaseClient();

  return catalogue.flatMap((row): Product[] => {
    const category = categoriesById.get(row.category_id);
    if (!category) {
      console.error(
        `Published product "${row.slug}" references an inactive or missing category.`,
      );
      return [];
    }

    const productImages = images
      .filter((image) => image.product_id === row.id)
      .sort((first, second) => {
        if (first.is_primary !== second.is_primary) {
          return Number(second.is_primary) - Number(first.is_primary);
        }
        return first.sort_order - second.sort_order;
      });
    const galleryImages = productImages.map((image) => ({
      src: image.storage_path
        ? supabaseCategories.storage
            .from("product-images")
            .getPublicUrl(image.storage_path).data.publicUrl
        : image.external_url ?? "",
      alt: image.alt_text || row.image_alt || row.name,
    }));
    const productVariants = variants.filter(
      (variant) => variant.product_id === row.id,
    );
    const colours = [...new Set(productVariants.map((variant) => variant.colour))];
    const sizes = [...new Set(productVariants.map((variant) => variant.size))];
    const image = galleryImages[0]?.src ?? "";

    return [
      {
        id: row.slug,
        name: row.name,
        category: category.name,
        description: row.description,
        price: Number(row.price),
        availability: row.availability,
        image,
        imageAlt: row.image_alt || row.name,
        galleryImages:
          galleryImages.length > 0
            ? galleryImages
            : [{ src: image, alt: row.image_alt || row.name }],
        colours: colours.length > 0 ? colours : ["Default"],
        sizes: sizes.length > 0 ? sizes : ["One size"],
        variants: productVariants.map((variant) => ({
          colour: variant.colour,
          size: variant.size,
          availability: variant.availability,
        })),
        materials: row.materials,
        details: row.details,
        featured: row.featured,
        isNew: row.is_new,
      },
    ];
  });
}

function createPublicSupabaseClient() {
  const config = getSupabaseConfig();
  if (!config.url || !config.key) {
    throw new Error(
      "Supabase public client was requested without project configuration.",
    );
  }
  return createClient<Database>(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

import Link from "next/link";
import { notFound } from "next/navigation";
import AdminNotice from "@/components/admin/admin-notice";
import ProductAdminForm from "@/components/admin/product-admin-form";
import { updateProduct } from "@/app/admin/actions";
import { requireKameaAdmin } from "@/lib/supabase/admin";
import type {
  CategoryRow,
  ProductImageRow,
  ProductRow,
  ProductVariantRow,
} from "@/lib/supabase/database.types";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string }>;
};

export default async function EditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
  const [{ id }, { message }] = await Promise.all([params, searchParams]);
  const { supabase } = await requireKameaAdmin();
  const [
    { data: product, error: productError },
    { data: categoryData, error: categoryError },
    { data: imageData, error: imageError },
    { data: variantData, error: variantError },
  ] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("product_images").select("*").eq("product_id", id).order("sort_order"),
    supabase.from("product_variants").select("*").eq("product_id", id).order("colour"),
  ]);
  if (productError || categoryError || imageError || variantError) {
    throw new Error(
      `Could not load product editor: ${[productError, categoryError, imageError, variantError].filter(Boolean).map((error) => error?.message).join("; ")}`,
    );
  }
  if (!product) {
    notFound();
  }

  const categories = categoryData as CategoryRow[];
  const images = imageData as ProductImageRow[];
  const variants = variantData as ProductVariantRow[];
  return (
    <section className="admin-page">
      <Link className="admin-back-link" href="/admin">← Products</Link>
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Catalogue management</p>
          <h1>Edit {product.name}</h1>
        </div>
      </div>
      {message ? <AdminNotice message={message} /> : null}
      <ProductAdminForm
        action={updateProduct}
        categories={categories}
        images={images.map((image) => {
          const publicUrl = image.storage_path
            ? supabase.storage
                .from("product-images")
                .getPublicUrl(image.storage_path).data.publicUrl
            : image.external_url ?? "";
          return {
            ...image,
            publicUrl,
          };
        })}
        product={product as ProductRow}
        submitLabel="Save changes"
        variants={variants}
      />
    </section>
  );
}

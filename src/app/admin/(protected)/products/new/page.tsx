import Link from "next/link";
import AdminNotice from "@/components/admin/admin-notice";
import ProductAdminForm from "@/components/admin/product-admin-form";
import { requireKameaAdmin } from "@/lib/supabase/admin";
import type { CategoryRow } from "@/lib/supabase/database.types";
import { createProduct } from "@/app/admin/actions";

type NewProductPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function NewProductPage({
  searchParams,
}: NewProductPageProps) {
  const { message } = await searchParams;
  const { supabase } = await requireKameaAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) {
    throw new Error(`Could not load product categories: ${error.message}`);
  }

  return (
    <section className="admin-page">
      <Link className="admin-back-link" href="/admin">← Products</Link>
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Catalogue management</p>
          <h1>Add a product</h1>
        </div>
      </div>
      {message ? <AdminNotice message={message} /> : null}
      {(data as CategoryRow[]).length === 0 ? (
        <AdminNotice message="Add a category before creating products." />
      ) : (
        <ProductAdminForm
          action={createProduct}
          categories={data as CategoryRow[]}
          submitLabel="Save product"
        />
      )}
    </section>
  );
}

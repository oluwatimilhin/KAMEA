import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CategoryRow,
  ProductImageRow,
  ProductRow,
} from "@/lib/supabase/database.types";
import ProductDeleteButton from "@/components/admin/product-delete-button";
import AdminNotice from "@/components/admin/admin-notice";

type AdminDashboardProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function AdminDashboard({
  searchParams,
}: AdminDashboardProps) {
  const { message } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const [
    { data: productData, error: productError },
    { data: categoryData, error: categoryError },
    { data: imageData, error: imageError },
  ] = await Promise.all([
    supabase.from("products").select("*").order("updated_at", { ascending: false }),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("product_images").select("product_id"),
  ]);

  if (productError || categoryError || imageError) {
    throw new Error(
      `Could not load admin catalogue: ${[productError, categoryError, imageError].filter(Boolean).map((error) => error?.message).join("; ")}`,
    );
  }

  const productRows = productData as ProductRow[];
  const categories = categoryData as CategoryRow[];
  const images = imageData as Pick<ProductImageRow, "product_id">[];
  const categoryById = new Map(categories.map((category) => [category.id, category.name]));
  const imageCounts = new Map<string, number>();
  images.forEach(({ product_id }) =>
    imageCounts.set(product_id, (imageCounts.get(product_id) ?? 0) + 1),
  );

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Your catalogue</p>
          <h1>Products</h1>
          <p>{productRows.length} product{productRows.length === 1 ? "" : "s"} · {categories.length} categories</p>
        </div>
        <Link className="button-link" href="/admin/products/new">
          Add a product
        </Link>
      </div>
      {message ? <AdminNotice message={message} /> : null}
      {productRows.length > 0 ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Category</th>
                <th scope="col">Price</th>
                <th scope="col">Availability</th>
                <th scope="col">Status</th>
                <th scope="col">Images</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productRows.map((product) => (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                    <span className="admin-table-subtext">/{product.slug}</span>
                  </td>
                  <td>{categoryById.get(product.category_id) ?? "Unavailable"}</td>
                  <td>GH₵{Number(product.price).toLocaleString("en-GH")}</td>
                  <td>{product.availability}</td>
                  <td>
                    <span className={`admin-status is-${product.status}`}>
                      {product.status}
                    </span>
                  </td>
                  <td>{imageCounts.get(product.id) ?? 0}</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link href={`/admin/products/${product.id}`}>Edit</Link>
                      <ProductDeleteButton
                        productId={product.id}
                        productName={product.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-empty">
          <h2>Your product database is ready.</h2>
          <p>Add your first product and it will appear in the public catalogue once published.</p>
          <Link className="button-link" href="/admin/products/new">
            Create first product
          </Link>
        </div>
      )}
    </section>
  );
}

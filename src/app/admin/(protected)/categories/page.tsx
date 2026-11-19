import AdminNotice from "@/components/admin/admin-notice";
import { createCategory, updateCategory, deleteCategory } from "@/app/admin/actions";
import { requireKameaAdmin } from "@/lib/supabase/admin";
import type { CategoryRow } from "@/lib/supabase/database.types";

type AdminCategoriesProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function AdminCategoriesPage({
  searchParams,
}: AdminCategoriesProps) {
  const { message } = await searchParams;
  const { supabase } = await requireKameaAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) {
    throw new Error(`Could not load KAMEA categories: ${error.message}`);
  }
  const categories = data as CategoryRow[];

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Catalogue structure</p>
          <h1>Categories</h1>
          <p>Organise products and choose which collections are visible in the shop.</p>
        </div>
      </div>
      {message ? <AdminNotice message={message} /> : null}
      <div className="admin-category-layout">
        <form action={createCategory} className="admin-card admin-category-form">
          <h2>Add category</h2>
          <label className="checkout-field">
            <span>Name</span>
            <input maxLength={80} name="name" required />
          </label>
          <label className="checkout-field">
            <span>Slug</span>
            <input
              maxLength={100}
              name="slug"
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              placeholder="home-decor"
              required
            />
          </label>
          <label className="checkout-field">
            <span>Description</span>
            <textarea maxLength={500} name="description" rows={3} />
          </label>
          <label className="checkout-field">
            <span>Cover image URL (HTTPS, optional)</span>
            <input name="image_url" type="url" />
          </label>
          <label className="checkout-field">
            <span>Display order</span>
            <input defaultValue={categories.length + 1} name="sort_order" type="number" />
          </label>
          <button className="button-link" type="submit">Add category</button>
        </form>

        <div className="admin-category-list">
          {categories.map((category) => (
            <article className="admin-card admin-category-card" key={category.id}>
              <form action={updateCategory} className="admin-category-form">
                <input name="category_id" type="hidden" value={category.id} />
                <label className="checkout-field">
                  <span>Name</span>
                  <input
                    defaultValue={category.name}
                    maxLength={80}
                    name="name"
                    required
                  />
                </label>
                <label className="checkout-field">
                  <span>Slug</span>
                  <input
                    defaultValue={category.slug}
                    maxLength={100}
                    name="slug"
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    required
                  />
                </label>
                <label className="checkout-field">
                  <span>Description</span>
                  <textarea
                    defaultValue={category.description}
                    maxLength={500}
                    name="description"
                    rows={2}
                  />
                </label>
                <label className="checkout-field">
                  <span>Cover image URL (HTTPS)</span>
                  <input
                    defaultValue={category.image_url ?? ""}
                    name="image_url"
                    type="url"
                  />
                </label>
                <label className="checkout-field">
                  <span>Display order</span>
                  <input
                    defaultValue={category.sort_order}
                    name="sort_order"
                    type="number"
                  />
                </label>
                <label className="admin-checkbox-label">
                  <input
                    defaultChecked={category.is_active}
                    name="is_active"
                    type="checkbox"
                  />
                  Visible in shop filters
                </label>
                <button className="button-link" type="submit">Save category</button>
              </form>
              <form action={deleteCategory} className="admin-category-delete">
                <input name="category_id" type="hidden" value={category.id} />
                <button className="admin-danger-link" type="submit">
                  Delete category
                </button>
                <span>Categories containing products cannot be deleted.</span>
              </form>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

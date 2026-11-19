import type { ProductAvailability } from "@/lib/products";
import type {
  CategoryRow,
  ProductImageRow,
  ProductRow,
  ProductVariantRow,
} from "@/lib/supabase/database.types";
import { deleteProductImage } from "@/app/admin/actions";

type AdminProductImage = ProductImageRow & { publicUrl: string };
type ProductAction = (formData: FormData) => Promise<void>;

const availabilityOptions: ProductAvailability[] = [
  "In stock",
  "Made to order",
  "Sold out",
];

export default function ProductAdminForm({
  action,
  categories,
  product,
  variants = [],
  images = [],
  submitLabel,
}: {
  action: ProductAction;
  categories: CategoryRow[];
  product?: ProductRow;
  variants?: ProductVariantRow[];
  images?: AdminProductImage[];
  submitLabel: string;
}) {
  const defaultVariants = variants.length
    ? variants
        .map(
          (variant) =>
            `${variant.colour} | ${variant.size} | ${variant.availability}`,
        )
        .join("\n")
    : `Oat | One size | ${product?.availability ?? "In stock"}`;

  return (
    <div className="admin-product-editor">
      <form action={action} className="admin-product-form">
      {product ? (
        <input name="product_id" type="hidden" value={product.id} />
      ) : null}
      <div className="admin-form-grid">
        <label className="checkout-field">
          <span>Product name</span>
          <input defaultValue={product?.name} maxLength={160} name="name" required />
        </label>
        <label className="checkout-field">
          <span>URL slug (lowercase, hyphenated)</span>
          <input
            defaultValue={product?.slug}
            maxLength={160}
            name="slug"
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            placeholder="soft-days-headband"
            required
          />
        </label>
        <label className="checkout-field">
          <span>Category</span>
          <select
            defaultValue={product?.category_id ?? categories[0]?.id}
            name="category_id"
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}{category.is_active ? "" : " (inactive)"}
              </option>
            ))}
          </select>
        </label>
        <label className="checkout-field">
          <span>Price (GHS)</span>
          <input
            defaultValue={product?.price ?? ""}
            min="0"
            name="price"
            required
            step="0.01"
            type="number"
          />
        </label>
        <label className="checkout-field">
          <span>Product availability</span>
          <select
            defaultValue={product?.availability ?? "In stock"}
            name="availability"
            required
          >
            {availabilityOptions.map((availability) => (
              <option key={availability} value={availability}>
                {availability}
              </option>
            ))}
          </select>
        </label>
        <label className="checkout-field">
          <span>Store visibility</span>
          <select defaultValue={product?.status ?? "draft"} name="status">
            <option value="draft">Draft (not public)</option>
            <option value="published">Published</option>
          </select>
        </label>
      </div>
      <label className="checkout-field">
        <span>Description</span>
        <textarea
          defaultValue={product?.description}
          maxLength={5000}
          name="description"
          required
          rows={4}
        />
      </label>
      <div className="admin-form-grid">
        <label className="checkout-field">
          <span>Materials (one per line)</span>
          <textarea
            defaultValue={product?.materials.join("\n")}
            name="materials"
            rows={4}
          />
        </label>
        <label className="checkout-field">
          <span>Product details (one per line)</span>
          <textarea
            defaultValue={product?.details.join("\n")}
            name="details"
            rows={4}
          />
        </label>
      </div>
      <label className="checkout-field">
        <span>Product variations (one Colour | Size | Availability per line)</span>
        <textarea
          defaultValue={defaultVariants}
          name="variants"
          required
          rows={5}
        />
        <span className="admin-help">
          Example: Oat | Small | In stock. Availability can be In stock, Made
          to order, or Sold out.
        </span>
      </label>
      <label className="checkout-field">
        <span>Image description for accessibility</span>
        <input
          defaultValue={product?.image_alt}
          maxLength={300}
          name="image_alt"
          placeholder="Hand-crocheted bag in natural cotton"
        />
      </label>
      <label className="checkout-field">
        <span>Add product images</span>
        <input
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          name="images"
          type="file"
        />
        <span className="admin-help">
          JPG, PNG, WebP, or AVIF; up to 8 MB per image. The first uploaded
          image becomes primary for a new product.
        </span>
      </label>
      <div className="admin-checkbox-row">
        <label>
          <input defaultChecked={product?.featured} name="featured" type="checkbox" />
          Feature on the storefront
        </label>
        <label>
          <input defaultChecked={product?.is_new} name="is_new" type="checkbox" />
          Mark as a new arrival
        </label>
      </div>
      <div className="admin-form-actions">
        <button className="button-link" type="submit">{submitLabel}</button>
      </div>
      </form>
      {images.length > 0 ? (
        <fieldset className="admin-existing-images">
          <legend>Current images</legend>
          <div className="admin-image-grid">
            {images.map((image) => (
              <div className="admin-image-card" key={image.id}>
                <div
                  aria-label={image.alt_text}
                  className="admin-image-preview"
                  role="img"
                  style={{ backgroundImage: `url("${image.publicUrl}")` }}
                />
                <span>{image.is_primary ? "Primary image" : image.alt_text}</span>
                <form action={deleteProductImage}>
                  <input name="image_id" type="hidden" value={image.id} />
                  <input
                    name="product_id"
                    type="hidden"
                    value={image.product_id}
                  />
                  <button className="admin-danger-link" type="submit">
                    Remove image
                  </button>
                </form>
              </div>
            ))}
          </div>
        </fieldset>
      ) : null}
    </div>
  );
}

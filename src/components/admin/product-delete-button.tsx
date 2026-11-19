"use client";

import { deleteProduct } from "@/app/admin/actions";

export default function ProductDeleteButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  return (
    <form
      action={deleteProduct}
      onSubmit={(event) => {
        if (!window.confirm(`Permanently delete "${productName}" and its images?`)) {
          event.preventDefault();
        }
      }}
    >
      <input name="product_id" type="hidden" value={productId} />
      <button className="admin-danger-link" type="submit">
        Delete
      </button>
    </form>
  );
}

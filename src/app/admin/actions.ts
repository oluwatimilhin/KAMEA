"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ProductAvailability } from "@/lib/products";
import type { ProductRow } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireKameaAdmin } from "@/lib/supabase/admin";

const allowedAvailability: ProductAvailability[] = [
  "In stock",
  "Made to order",
  "Sold out",
];
const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const maximumImageBytes = 8 * 1024 * 1024;

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseList(value: string) {
  return [...new Set(value.split(/\r?\n/).map((part) => part.trim()).filter(Boolean))];
}

function validateSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function readProductForm(formData: FormData) {
  const slug = getString(formData, "slug");
  const name = getString(formData, "name");
  const categoryId = getString(formData, "category_id");
  const description = getString(formData, "description");
  const imageAlt = getString(formData, "image_alt");
  const rawPrice = getString(formData, "price");
  const rawAvailability = getString(formData, "availability");
  const status = getString(formData, "status");
  const variants = getString(formData, "variants")
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [colour = "", size = "", availability = rawAvailability] =
        row.split("|").map((part) => part.trim());
      return { colour, size, availability };
    });
  const price = Number(rawPrice);

  if (!validateSlug(slug)) {
    throw new Error("Use a lowercase product URL slug, such as soft-days-bag.");
  }
  if (
    !name ||
    name.length > 160 ||
    !categoryId ||
    description.length > 5000 ||
    imageAlt.length > 300
  ) {
    throw new Error("Complete the product name, category, and description.");
  }
  if (!Number.isFinite(price) || price < 0 || price > 100000000) {
    throw new Error("Enter a valid product price in GHS.");
  }
  if (!allowedAvailability.includes(rawAvailability as ProductAvailability)) {
    throw new Error("Choose a valid product availability.");
  }
  if (status !== "draft" && status !== "published") {
    throw new Error("Choose whether the product is a draft or published.");
  }
  if (
    variants.length === 0 ||
    variants.length > 60 ||
    variants.some(
      (variant) =>
        !variant.colour ||
        !variant.size ||
        variant.colour.length > 80 ||
        variant.size.length > 80 ||
        !allowedAvailability.includes(
          variant.availability as ProductAvailability,
        ),
    )
  ) {
    throw new Error(
      "Add at least one valid variation. Use one Colour | Size | Availability per line.",
    );
  }

  const imageFiles = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const distinctColours = new Set(variants.map((variant) => variant.colour));
  const distinctSizes = new Set(variants.map((variant) => variant.size));
  const distinctVariations = new Set(
    variants.map((variant) => `${variant.colour}\u0000${variant.size}`),
  );
  if (
    !rawPrice ||
    imageFiles.some(
      (file) =>
        !allowedImageTypes.has(file.type) || file.size > maximumImageBytes,
    )
  ) {
    throw new Error("Enter a product price and use JPG, PNG, WebP, or AVIF images no larger than 8 MB each.");
  }
  if (imageFiles.length > 10) {
    throw new Error("Upload no more than 10 images at a time.");
  }
  if (
    distinctVariations.size !== variants.length ||
    distinctVariations.size !== distinctColours.size * distinctSizes.size
  ) {
    throw new Error(
      "Add one variation row for every colour and size combination. Each combination must be unique.",
    );
  }

  return {
    slug,
    name,
    categoryId,
    description,
    imageAlt: imageAlt || name,
    price,
    availability: rawAvailability as ProductAvailability,
    status,
    materials: parseList(getString(formData, "materials")),
    details: parseList(getString(formData, "details")),
    featured: formData.get("featured") === "on",
    isNew: formData.get("is_new") === "on",
    variants,
    imageFiles,
  };
}

function redirectWithMessage(path: string, message: string): never {
  redirect(`${path}?message=${encodeURIComponent(message)}`);
}

function revalidateStorefront() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/catalogue");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/checkout");
}

async function uploadProductImages(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  product: ProductRow,
  files: File[],
  startAt: number,
) {
  const uploadedPaths: string[] = [];

  for (const [index, file] of files.entries()) {
    const extension = file.name.split(".").pop()?.toLowerCase();
    const safeExtension =
      extension && /^[a-z0-9]{2,5}$/.test(extension) ? extension : "img";
    const storagePath = `${product.slug}/${crypto.randomUUID()}.${safeExtension}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(storagePath, file, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      if (uploadedPaths.length > 0) {
        const { error: metadataError } = await supabase
          .from("product_images")
          .delete()
          .in("storage_path", uploadedPaths);
        if (metadataError) {
          console.error("Could not clean up KAMEA image metadata.", metadataError);
        }
        const { error: removeError } = await supabase.storage
          .from("product-images")
          .remove(uploadedPaths);
        if (removeError) {
          console.error("Could not clean up partially uploaded KAMEA images.", removeError);
        }
      }
      throw new Error(`Could not upload ${file.name}: ${uploadError.message}`);
    }

    uploadedPaths.push(storagePath);
    const { error: imageError } = await supabase.from("product_images").insert({
      product_id: product.id,
      storage_path: storagePath,
      external_url: null,
      alt_text: product.image_alt,
      sort_order: startAt + index,
      is_primary: startAt + index === 0,
    });

    if (imageError) {
      const { error: metadataError } = await supabase
        .from("product_images")
        .delete()
        .in("storage_path", uploadedPaths);
      if (metadataError) {
        console.error("Could not clean up KAMEA image metadata after insert failed.", metadataError);
      }
      const { error: removeError } = await supabase.storage
        .from("product-images")
        .remove(uploadedPaths);
      if (removeError) {
        console.error("Could not clean up KAMEA images after metadata failed.", removeError);
      }
      throw new Error(`Could not save product image details: ${imageError.message}`);
    }
  }
}

async function saveVariants(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  productId: string,
  variants: { colour: string; size: string; availability: string }[],
) {
  const { error } = await supabase.rpc("replace_product_variants", {
    p_product_id: productId,
    p_variants: variants,
  });
  if (error) {
    throw new Error(`Could not save product variations: ${error.message}`);
  }
}

export async function signInAction(formData: FormData) {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  if (!email || !password) {
    redirectWithMessage("/admin/login", "Enter your admin email and password.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error("KAMEA administrator sign-in failed.", error.message);
    redirectWithMessage("/admin/login", "Sign-in failed. Check your credentials and administrator access.");
  }

  redirect("/admin");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Could not sign out of KAMEA admin: ${error.message}`);
  }
  redirect("/admin/login");
}

export async function createProduct(formData: FormData) {
  const { supabase } = await requireKameaAdmin();
  let form: ReturnType<typeof readProductForm>;
  try {
    form = readProductForm(formData);
  } catch (error) {
    redirectWithMessage(
      "/admin/products/new",
      error instanceof Error ? error.message : "Product details are invalid.",
    );
  }
  if (form.status === "published" && form.imageFiles.length === 0) {
    redirectWithMessage(
      "/admin/products/new",
      "Upload at least one product image before publishing.",
    );
  }
  const insertPayload = {
    slug: form.slug,
    name: form.name,
    description: form.description,
    category_id: form.categoryId,
    price: form.price,
    availability: form.availability,
    status: "draft" as const,
    materials: form.materials,
    details: form.details,
    featured: form.featured,
    is_new: form.isNew,
    image_alt: form.imageAlt,
  };
  const { data: product, error } = await supabase
    .from("products")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error || !product) {
    redirectWithMessage(
      "/admin/products/new",
      error?.message ?? "Could not create the product.",
    );
  }

  try {
    await saveVariants(supabase, product.id, form.variants);
    await uploadProductImages(supabase, product, form.imageFiles, 0);
    if (form.status === "published") {
      const { error: publishError } = await supabase
        .from("products")
        .update({ status: "published" })
        .eq("id", product.id);
      if (publishError) {
        throw new Error(`Could not publish the product: ${publishError.message}`);
      }
    }
  } catch (error) {
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);
    if (deleteError) {
      console.error("Could not roll back an incomplete KAMEA product.", deleteError);
    }
    redirectWithMessage(
      "/admin/products/new",
      error instanceof Error ? error.message : "Could not save the product.",
    );
  }

  revalidateStorefront();
  redirectWithMessage("/admin", `${product.name} was saved.`);
}

export async function updateProduct(formData: FormData) {
  const { supabase } = await requireKameaAdmin();
  const productId = getString(formData, "product_id");
  if (!productId) {
    redirectWithMessage("/admin", "The product identifier is missing.");
  }
  let form: ReturnType<typeof readProductForm>;
  try {
    form = readProductForm(formData);
  } catch (error) {
    redirectWithMessage(
      `/admin/products/${productId}`,
      error instanceof Error ? error.message : "Product details are invalid.",
    );
  }
  if (form.status === "published" && form.imageFiles.length === 0) {
    const { count, error: countError } = await supabase
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId);
    if (countError) {
      redirectWithMessage(
        `/admin/products/${productId}`,
        `Could not verify product images: ${countError.message}`,
      );
    }
    if (!count) {
      redirectWithMessage(
        `/admin/products/${productId}`,
        "Upload at least one product image before publishing.",
      );
    }
  }
  const { data: product, error } = await supabase
    .from("products")
    .update({
      slug: form.slug,
      name: form.name,
      description: form.description,
      category_id: form.categoryId,
      price: form.price,
      availability: form.availability,
      status: form.status as ProductRow["status"],
      materials: form.materials,
      details: form.details,
      featured: form.featured,
      is_new: form.isNew,
      image_alt: form.imageAlt,
    })
    .eq("id", productId)
    .select("*")
    .single();

  if (error || !product) {
    redirectWithMessage(
      `/admin/products/${productId}`,
      error?.message ?? "Could not update the product.",
    );
  }

  try {
    await saveVariants(supabase, product.id, form.variants);
    const { data: existingImages, error: imagesError } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", product.id);
    if (imagesError) {
      throw new Error(`Could not read existing product images: ${imagesError.message}`);
    }
    await uploadProductImages(
      supabase,
      product,
      form.imageFiles,
      existingImages.length,
    );
  } catch (error) {
    redirectWithMessage(
      `/admin/products/${productId}`,
      error instanceof Error ? error.message : "Could not save product changes.",
    );
  }

  revalidateStorefront();
  redirectWithMessage(`/admin/products/${productId}`, "Product changes saved.");
}

export async function deleteProduct(formData: FormData) {
  const { supabase } = await requireKameaAdmin();
  const productId = getString(formData, "product_id");
  const { data: images, error: imagesError } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("product_id", productId);
  if (imagesError) {
    redirectWithMessage("/admin", `Could not read product images: ${imagesError.message}`);
  }

  const paths = images.map((image) => image.storage_path);
  const uploadedPaths = paths.filter((path): path is string => path !== null);
  if (uploadedPaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("product-images")
      .remove(uploadedPaths);
    if (storageError) {
      redirectWithMessage("/admin", `Could not remove product images: ${storageError.message}`);
    }
  }

  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) {
    redirectWithMessage("/admin", `Could not delete the product: ${error.message}`);
  }

  revalidateStorefront();
  redirectWithMessage("/admin", "Product deleted.");
}

export async function deleteProductImage(formData: FormData) {
  const { supabase } = await requireKameaAdmin();
  const imageId = getString(formData, "image_id");
  const productId = getString(formData, "product_id");
  const { data: image, error: imageError } = await supabase
    .from("product_images")
    .select("storage_path, is_primary")
    .eq("id", imageId)
    .eq("product_id", productId)
    .single();
  if (imageError || !image) {
    redirectWithMessage(
      `/admin/products/${productId}`,
      imageError?.message ?? "Could not find that image.",
    );
  }

  if (image.storage_path) {
    const { error: storageError } = await supabase.storage
      .from("product-images")
      .remove([image.storage_path]);
    if (storageError) {
      redirectWithMessage(
        `/admin/products/${productId}`,
        `Could not remove the image file: ${storageError.message}`,
      );
    }
  }
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);
  if (error) {
    redirectWithMessage(
      `/admin/products/${productId}`,
      `Could not remove the image record: ${error.message}`,
    );
  }

  if (image.is_primary) {
    const { data: nextImage, error: nextImageError } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId)
      .order("sort_order")
      .limit(1)
      .maybeSingle();
    if (nextImageError) {
      redirectWithMessage(
        `/admin/products/${productId}`,
        `Image removed, but could not select a new primary: ${nextImageError.message}`,
      );
    }
    if (nextImage) {
      const { error: updateError } = await supabase
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", nextImage.id);
      if (updateError) {
        redirectWithMessage(
          `/admin/products/${productId}`,
          `Image removed, but could not select a new primary: ${updateError.message}`,
        );
      }
    }
  }
  revalidateStorefront();
  redirectWithMessage(`/admin/products/${productId}`, "Image removed.");
}

export async function createCategory(formData: FormData) {
  const { supabase } = await requireKameaAdmin();
  const name = getString(formData, "name");
  const slug = getString(formData, "slug");
  const description = getString(formData, "description");
  const imageUrl = getString(formData, "image_url");
  const sortOrder = Number(getString(formData, "sort_order") || "0");

  if (
    !name ||
    name.length > 80 ||
    !validateSlug(slug) ||
    description.length > 500 ||
    !Number.isSafeInteger(sortOrder) ||
    (imageUrl &&
      (imageUrl.length > 2048 || !isValidOptionalHttpsUrl(imageUrl)))
  ) {
    redirectWithMessage("/admin/categories", "Check category details and try again.");
  }

  const { error } = await supabase.from("categories").insert({
    name,
    slug,
    description,
    image_url: imageUrl || null,
    sort_order: sortOrder,
    is_active: true,
  });
  if (error) {
    redirectWithMessage("/admin/categories", `Could not create category: ${error.message}`);
  }
  revalidateStorefront();
  redirectWithMessage("/admin/categories", `${name} category added.`);
}

export async function updateCategory(formData: FormData) {
  const { supabase } = await requireKameaAdmin();
  const categoryId = getString(formData, "category_id");
  const name = getString(formData, "name");
  const slug = getString(formData, "slug");
  const description = getString(formData, "description");
  const imageUrl = getString(formData, "image_url");
  const sortOrder = Number(getString(formData, "sort_order") || "0");
  const isActive = formData.get("is_active") === "on";

  if (
    !categoryId ||
    !name ||
    name.length > 80 ||
    !validateSlug(slug) ||
    description.length > 500 ||
    !Number.isSafeInteger(sortOrder) ||
    (imageUrl &&
      (imageUrl.length > 2048 || !isValidOptionalHttpsUrl(imageUrl)))
  ) {
    redirectWithMessage("/admin/categories", "Check category details and try again.");
  }

  const { error } = await supabase
    .from("categories")
    .update({
      name,
      slug,
      description,
      image_url: imageUrl || null,
      sort_order: sortOrder,
      is_active: isActive,
    })
    .eq("id", categoryId);
  if (error) {
    redirectWithMessage("/admin/categories", `Could not update category: ${error.message}`);
  }
  revalidateStorefront();
  redirectWithMessage("/admin/categories", `${name} category updated.`);
}

export async function deleteCategory(formData: FormData) {
  const { supabase } = await requireKameaAdmin();
  const categoryId = getString(formData, "category_id");
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) {
    redirectWithMessage(
      "/admin/categories",
      `Could not delete category. Remove or reassign its products first. (${error.message})`,
    );
  }
  revalidateStorefront();
  redirectWithMessage("/admin/categories", "Category deleted.");
}

function isValidOptionalHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

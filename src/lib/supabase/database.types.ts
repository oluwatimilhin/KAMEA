type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category_id: string;
  price: number;
  availability: "In stock" | "Made to order" | "Sold out";
  status: "draft" | "published";
  materials: string[];
  details: string[];
  featured: boolean;
  is_new: boolean;
  image_alt: string;
  created_at: string;
  updated_at: string;
};

export type ProductImageRow = {
  id: string;
  product_id: string;
  storage_path: string | null;
  external_url: string | null;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
};

export type ProductVariantRow = {
  id: string;
  product_id: string;
  colour: string;
  size: string;
  sku: string | null;
  availability: "In stock" | "Made to order" | "Sold out";
  stock_quantity: number | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      admin_users: Table<
        { user_id: string; created_at: string },
        { user_id: string; created_at?: string }
      >;
      categories: Table<
        CategoryRow,
        Omit<CategoryRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      products: Table<
        ProductRow,
        Omit<ProductRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      product_images: Table<
        ProductImageRow,
        Omit<ProductImageRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
          external_url?: string | null;
        }
      >;
      product_variants: Table<
        ProductVariantRow,
        Omit<ProductVariantRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      is_kamea_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      replace_product_variants: {
        Args: {
          p_product_id: string;
          p_variants: {
            colour: string;
            size: string;
            availability: string;
          }[];
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null unique check (char_length(name) between 1 and 80),
  description text not null default '',
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 160),
  description text not null default '',
  category_id uuid not null references public.categories (id) on delete restrict,
  price numeric(12, 2) not null check (price >= 0),
  availability text not null default 'In stock'
    check (availability in ('In stock', 'Made to order', 'Sold out')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  materials text[] not null default '{}',
  details text[] not null default '{}',
  featured boolean not null default false,
  is_new boolean not null default false,
  image_alt text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text unique,
  external_url text,
  alt_text text not null default '',
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  check (num_nonnulls(storage_path, external_url) = 1)
);

create unique index if not exists product_images_one_primary_per_product
  on public.product_images (product_id)
  where is_primary;

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  colour text not null check (char_length(colour) between 1 and 80),
  size text not null check (char_length(size) between 1 and 80),
  sku text,
  availability text not null default 'In stock'
    check (availability in ('In stock', 'Made to order', 'Sold out')),
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, colour, size)
);

create index if not exists products_public_catalogue_idx
  on public.products (status, featured, category_id);
create index if not exists product_images_product_order_idx
  on public.product_images (product_id, sort_order);
create index if not exists product_variants_product_idx
  on public.product_variants (product_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists product_variants_set_updated_at on public.product_variants;
create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

create or replace function public.is_kamea_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_kamea_admin() from public;
grant execute on function public.is_kamea_admin() to anon, authenticated;

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;

create policy "Admins can read administrator allowlist"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_kamea_admin()));

create policy "Anyone can read active categories"
  on public.categories for select to anon, authenticated
  using (is_active or (select public.is_kamea_admin()));
create policy "Admins can insert categories"
  on public.categories for insert to authenticated
  with check ((select public.is_kamea_admin()));
create policy "Admins can update categories"
  on public.categories for update to authenticated
  using ((select public.is_kamea_admin()))
  with check ((select public.is_kamea_admin()));
create policy "Admins can delete categories"
  on public.categories for delete to authenticated
  using ((select public.is_kamea_admin()));

create policy "Anyone can read published products"
  on public.products for select to anon, authenticated
  using (status = 'published' or (select public.is_kamea_admin()));
create policy "Admins can insert products"
  on public.products for insert to authenticated
  with check ((select public.is_kamea_admin()));
create policy "Admins can update products"
  on public.products for update to authenticated
  using ((select public.is_kamea_admin()))
  with check ((select public.is_kamea_admin()));
create policy "Admins can delete products"
  on public.products for delete to authenticated
  using ((select public.is_kamea_admin()));

create policy "Anyone can read images of published products"
  on public.product_images for select to anon, authenticated
  using (
    (select public.is_kamea_admin())
    or exists (
      select 1 from public.products
      where products.id = product_images.product_id
        and products.status = 'published'
    )
  );
create policy "Admins can insert product images"
  on public.product_images for insert to authenticated
  with check ((select public.is_kamea_admin()));
create policy "Admins can update product images"
  on public.product_images for update to authenticated
  using ((select public.is_kamea_admin()))
  with check ((select public.is_kamea_admin()));
create policy "Admins can delete product images"
  on public.product_images for delete to authenticated
  using ((select public.is_kamea_admin()));

create policy "Anyone can read variants of published products"
  on public.product_variants for select to anon, authenticated
  using (
    (select public.is_kamea_admin())
    or exists (
      select 1 from public.products
      where products.id = product_variants.product_id
        and products.status = 'published'
    )
  );
create policy "Admins can insert product variants"
  on public.product_variants for insert to authenticated
  with check ((select public.is_kamea_admin()));
create policy "Admins can update product variants"
  on public.product_variants for update to authenticated
  using ((select public.is_kamea_admin()))
  with check ((select public.is_kamea_admin()));
create policy "Admins can delete product variants"
  on public.product_variants for delete to authenticated
  using ((select public.is_kamea_admin()));

revoke all on public.admin_users, public.categories, public.products,
  public.product_images, public.product_variants from anon, authenticated;

grant select on public.categories, public.products,
  public.product_images, public.product_variants to anon, authenticated;
grant select on public.admin_users to authenticated;
grant insert, update, delete on public.categories, public.products,
  public.product_images, public.product_variants to authenticated;

create or replace function public.replace_product_variants(
  p_product_id uuid,
  p_variants jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not (select public.is_kamea_admin()) then
    raise exception 'Administrator access is required.';
  end if;

  if jsonb_typeof(p_variants) <> 'array' or jsonb_array_length(p_variants) = 0 then
    raise exception 'At least one product variation is required.';
  end if;

  delete from public.product_variants
  where product_id = p_product_id;

  insert into public.product_variants (
    product_id, colour, size, availability
  )
  select
    p_product_id,
    parsed.value ->> 'colour',
    parsed.value ->> 'size',
    parsed.value ->> 'availability'
  from jsonb_array_elements(p_variants) as parsed(value);
end;
$$;

revoke all on function public.replace_product_variants(uuid, jsonb) from public;
grant execute on function public.replace_product_variants(uuid, jsonb) to authenticated;

insert into public.categories (slug, name, description, sort_order)
values
  ('bags', 'Bags', 'Carry something made just for you.', 1),
  ('clothing', 'Clothing', 'Wearable layers, made slowly.', 2),
  ('accessories', 'Accessories', 'Small details with a handmade touch.', 3),
  ('home-decor', 'Home Décor', 'Soft textures for slower moments.', 4),
  ('custom-crochet', 'Custom Crochet', 'A one-of-a-kind piece, made with you.', 5)
on conflict (slug) do nothing;

update public.categories
set image_url = case slug
  when 'bags' then 'https://images.unsplash.com/photo-1594638963668-52eb9798e8ca?auto=format&fit=crop&w=900&q=85'
  when 'clothing' then 'https://images.unsplash.com/photo-1679847628912-4c3e7402abc7?auto=format&fit=crop&w=900&q=85'
  when 'accessories' then 'https://images.unsplash.com/photo-1668072587859-f0f30c8fa938?auto=format&fit=crop&w=900&q=85'
  when 'home-decor' then 'https://images.unsplash.com/photo-1728393287642-13bee7126ae8?auto=format&fit=crop&w=900&q=85'
  when 'custom-crochet' then 'https://images.unsplash.com/photo-1620633437938-be73c35eb77e?auto=format&fit=crop&w=900&q=85'
  else image_url
end
where slug in ('bags', 'clothing', 'accessories', 'home-decor', 'custom-crochet');

with seed (
  slug, name, description, category_slug, price, availability, materials, details,
  featured, is_new, image_alt, image_url
) as (
  values
    ('sunday-market-tote', 'Sunday Market Tote', 'A roomy, hand-crocheted carryall for market mornings and everyday errands.', 'bags', 680, 'In stock', array['100% cotton yarn', 'Cotton lining'], array['Hand-crocheted in small batches', 'Soft-lined interior', 'Spot clean gently'], true, false, 'Textured handmade tote in warm natural tones', 'https://images.unsplash.com/photo-1594638963668-52eb9798e8ca?auto=format&fit=crop&w=1000&q=85'),
    ('everyday-crochet-pouch', 'Everyday Crochet Pouch', 'A soft-lined little pouch for the small things you like to keep close.', 'bags', 320, 'Made to order', array['100% cotton yarn', 'Cotton lining', 'Wooden button'], array['Made to order in our workroom', 'Hand-finished button closure', 'Allow 7–10 days for making'], false, true, 'Close view of a handmade crochet accessory', 'https://images.unsplash.com/photo-1620633437938-be73c35eb77e?auto=format&fit=crop&w=1000&q=85'),
    ('the-slow-morning-cardigan', 'Slow Morning Cardigan', 'An easy, textured layer, crocheted slowly in a soft, breathable yarn.', 'clothing', 1450, 'Made to order', array['Cotton and linen blend', 'Natural corozo buttons'], array['Relaxed, easy-to-layer fit', 'Made to order in our workroom', 'Allow 2–3 weeks for making'], true, false, 'Handmade crochet clothing in a neutral palette', 'https://images.unsplash.com/photo-1679847628912-4c3e7402abc7?auto=format&fit=crop&w=1000&q=85'),
    ('heirloom-crochet-vest', 'Heirloom Crochet Vest', 'A considered layering piece with an open stitch and a relaxed fit.', 'clothing', 980, 'In stock', array['100% cotton yarn'], array['Open stitch with a relaxed fit', 'Hand-finished edges', 'Ready to ship'], false, true, 'Soft yarn and crochet details for a handmade vest', 'https://images.unsplash.com/photo-1668072587859-f0f30c8fa938?auto=format&fit=crop&w=1000&q=85'),
    ('soft-days-headband', 'Soft Days Headband', 'A gentle, comfortable headband finished by hand in a versatile neutral.', 'accessories', 180, 'In stock', array['Soft cotton blend'], array['Gentle stretch for a comfortable fit', 'Handmade in small batches', 'Ready to ship'], false, false, 'Warm natural yarn ready to become a crochet accessory', 'https://images.unsplash.com/photo-1668072587859-f0f30c8fa938?auto=format&fit=crop&w=1000&q=85'),
    ('little-cloud-neck-wrap', 'Little Cloud Neck Wrap', 'A softly textured accent that adds a little warmth to cool evenings.', 'accessories', 360, 'Sold out', array['Cotton and wool blend'], array['Soft, cosy texture', 'Currently sold out', 'Join us again for the next small batch'], false, false, 'A handmade wearable crochet piece', 'https://images.unsplash.com/photo-1679847628912-4c3e7402abc7?auto=format&fit=crop&w=1000&q=85'),
    ('slow-living-cushion', 'Slow Living Cushion Cover', 'A tactile cushion cover with a removable backing for easy care.', 'home-decor', 540, 'In stock', array['100% cotton yarn', 'Cotton backing'], array['Removable envelope-style backing', 'Cushion insert not included', 'Gentle hand wash'], true, false, 'Handmade crochet textures for a calm home', 'https://images.unsplash.com/photo-1728393287642-13bee7126ae8?auto=format&fit=crop&w=1000&q=85'),
    ('little-heirloom-throw', 'Little Heirloom Throw', 'A cosy, hand-finished throw made for quiet afternoons at home.', 'home-decor', 1650, 'Made to order', array['100% cotton yarn'], array['Made to order in our workroom', 'Size and colour affect making time', 'Allow 2–4 weeks for making'], false, true, 'Close-up of a warm handmade crochet throw', 'https://images.unsplash.com/photo-1620633437938-be73c35eb77e?auto=format&fit=crop&w=1000&q=85'),
    ('made-for-you-keepsake', 'Made-for-You Keepsake', 'A collaborative custom piece, shaped around your colours and ideas.', 'custom-crochet', 850, 'Made to order', array['Selected together for your commission'], array['A KAMEA maker will confirm your design', 'Final price depends on size and materials', 'Allow 2–4 weeks after design approval'], true, false, 'Yarn colours and tools for a custom crochet commission', 'https://images.unsplash.com/photo-1668072587859-f0f30c8fa938?auto=format&fit=crop&w=1000&q=85'),
    ('personalised-home-piece', 'Personalised Home Piece', 'A thoughtful made-to-order home accent, created in a palette you love.', 'custom-crochet', 720, 'Made to order', array['Selected together for your commission'], array['Made around your space and ideas', 'A KAMEA maker will confirm your design', 'Allow 2–4 weeks after design approval'], false, true, 'Hand-crocheted home accessory in a soft neutral setting', 'https://images.unsplash.com/photo-1728393287642-13bee7126ae8?auto=format&fit=crop&w=1000&q=85')
)
insert into public.products (
  slug, name, description, category_id, price, availability, status, materials,
  details, featured, is_new, image_alt
)
select
  seed.slug,
  seed.name,
  seed.description,
  category.id,
  seed.price,
  seed.availability,
  'published',
  seed.materials,
  seed.details,
  seed.featured,
  seed.is_new,
  seed.image_alt
from seed
join public.categories as category on category.slug = seed.category_slug
on conflict (slug) do nothing;

with seed (slug, image_url) as (
  values
    ('sunday-market-tote', 'https://images.unsplash.com/photo-1594638963668-52eb9798e8ca?auto=format&fit=crop&w=1000&q=85'),
    ('everyday-crochet-pouch', 'https://images.unsplash.com/photo-1620633437938-be73c35eb77e?auto=format&fit=crop&w=1000&q=85'),
    ('the-slow-morning-cardigan', 'https://images.unsplash.com/photo-1679847628912-4c3e7402abc7?auto=format&fit=crop&w=1000&q=85'),
    ('heirloom-crochet-vest', 'https://images.unsplash.com/photo-1668072587859-f0f30c8fa938?auto=format&fit=crop&w=1000&q=85'),
    ('soft-days-headband', 'https://images.unsplash.com/photo-1668072587859-f0f30c8fa938?auto=format&fit=crop&w=1000&q=85'),
    ('little-cloud-neck-wrap', 'https://images.unsplash.com/photo-1679847628912-4c3e7402abc7?auto=format&fit=crop&w=1000&q=85'),
    ('slow-living-cushion', 'https://images.unsplash.com/photo-1728393287642-13bee7126ae8?auto=format&fit=crop&w=1000&q=85'),
    ('little-heirloom-throw', 'https://images.unsplash.com/photo-1620633437938-be73c35eb77e?auto=format&fit=crop&w=1000&q=85'),
    ('made-for-you-keepsake', 'https://images.unsplash.com/photo-1668072587859-f0f30c8fa938?auto=format&fit=crop&w=1000&q=85'),
    ('personalised-home-piece', 'https://images.unsplash.com/photo-1728393287642-13bee7126ae8?auto=format&fit=crop&w=1000&q=85')
)
insert into public.product_images (
  product_id, external_url, alt_text, sort_order, is_primary
)
select product.id, seed.image_url, product.image_alt, 0, true
from seed
join public.products as product on product.slug = seed.slug
where not exists (
  select 1 from public.product_images as current_image
  where current_image.product_id = product.id
);

with variants (slug, colours, sizes) as (
  values
    ('sunday-market-tote', array['Oat', 'Cocoa', 'Olive'], array['One size']),
    ('everyday-crochet-pouch', array['Oat', 'Rose', 'Cocoa'], array['Small', 'Medium']),
    ('the-slow-morning-cardigan', array['Oat', 'Cocoa', 'Terracotta'], array['XS–S', 'M–L', 'XL–XXL']),
    ('heirloom-crochet-vest', array['Natural', 'Olive'], array['XS–S', 'M–L', 'XL–XXL']),
    ('soft-days-headband', array['Oat', 'Rose', 'Cocoa'], array['One size']),
    ('little-cloud-neck-wrap', array['Oat', 'Cocoa'], array['One size']),
    ('slow-living-cushion', array['Natural', 'Olive', 'Cocoa'], array['40 × 40 cm', '50 × 50 cm']),
    ('little-heirloom-throw', array['Oat', 'Olive', 'Cocoa'], array['Baby', 'Throw', 'Large throw']),
    ('made-for-you-keepsake', array['Choose your colours'], array['Made to your measurements']),
    ('personalised-home-piece', array['Choose your colours'], array['Made to your measurements'])
)
insert into public.product_variants (product_id, colour, size, availability)
select
  product.id,
  colour_values.colour,
  size_values.size,
  product.availability
from variants
join public.products as product on product.slug = variants.slug
cross join lateral unnest(variants.colours) as colour_values(colour)
cross join lateral unnest(variants.sizes) as size_values(size)
on conflict (product_id, colour, size) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Anyone can view KAMEA product images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-images');
create policy "Admins can upload KAMEA product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_kamea_admin()));
create policy "Admins can update KAMEA product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_kamea_admin()))
  with check (bucket_id = 'product-images' and (select public.is_kamea_admin()));
create policy "Admins can delete KAMEA product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_kamea_admin()));

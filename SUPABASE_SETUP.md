# KAMEA Supabase setup

Complete these steps in order. You do not need to send credentials or keys in chat.

## 1. Create a Supabase project

1. Sign in at [supabase.com](https://supabase.com/) and create a new project for KAMEA.
2. Choose a project name and region close to your customers.
3. Set a strong database password and store it in a password manager. It is not used by the website.
4. Wait for the project to finish provisioning.

## 2. Create the database, policies, storage bucket, and starter catalogue

1. In your Supabase project, open **SQL Editor** and create a new query.
2. Open `supabase/migrations/202611030001_catalog_and_admin.sql` in this project.
3. Copy the complete migration into the SQL Editor and run it once.
4. Confirm the query succeeds. It creates categories, products, image and variation tables, the `product-images` bucket, Row Level Security policies, and starter catalogue records.

The starter product pictures use the site's existing sample image URLs. Replace them with KAMEA's real product photography in the admin dashboard when available.

## 3. Create your administrator login

1. In Supabase, open **Authentication → Users** and add a user with your admin email address and a strong password. Confirm/verify the user in the dashboard if Supabase requests it.
2. Open **SQL Editor** and run the following, replacing the email with the exact email used for the user:

   ```sql
   insert into public.admin_users (user_id)
   select id
   from auth.users
   where email = 'you@example.com'
   on conflict (user_id) do nothing;
   ```

3. Confirm that one matching row was added:

   ```sql
   select admin_users.user_id, auth.users.email
   from public.admin_users
   join auth.users on auth.users.id = admin_users.user_id;
   ```

Only project owners/operators with privileged SQL access should grant administrator membership. Do not add a public administrator sign-up flow.

## 4. Set the website's public Supabase configuration

1. In Supabase, open **Project Settings → API** (or **API Keys**).
2. Copy the **Project URL** and the **Publishable key**. If your project shows legacy keys instead, use the `anon` key.
3. In `kamea-shop`, copy `.env.example` to `.env.local`.
4. Set these entries in `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-or-anon-key
   ```

   Use your actual values locally. Do not paste them into chat, commit `.env.local`, or put a `service_role`/secret key in the site. The publishable/anon key is intended for browser-facing applications; RLS is what protects the data.

5. Stop and restart the Next.js development server so it reads the new variables:

   ```powershell
   npm run dev
   ```

## 5. Sign in and manage KAMEA's catalogue

1. Visit [http://localhost:3000/admin/login](http://localhost:3000/admin/login).
2. Sign in using the Supabase user you added to `admin_users`.
3. Add, edit, publish, or delete products and categories. Product prices are entered in GHS.
4. Upload JPG, PNG, WebP, or AVIF product images up to 8 MB each. The first uploaded image is used as the primary product image.
5. Define each variation on its own line as `Colour | Size | Availability`, for example `Oat | Small | In stock`.
6. Products saved as **Draft** remain private; switch to **Published** to show them on the storefront.

## Security notes

- RLS is enabled for every catalogue and administrator table. Public reads are limited to published products, their images/variations, and active categories.
- The `product-images` bucket is public-read so storefront images can load without an account. Upload, update, and delete operations require an authenticated KAMEA administrator.
- The app checks the administrator allowlist on protected pages and every server action. RLS independently enforces the same restrictions in the database and Storage.
- Admin credentials are managed by Supabase Auth. The app does not expose a user sign-up route.
- Never add a Supabase service-role/secret key to `NEXT_PUBLIC_*`, client components, or source control. This app does not require the service-role key.
- Use a separate Supabase project for production and configure the same migration, administrator allowlist, and environment variables in your hosting provider's secret settings.

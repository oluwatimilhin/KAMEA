# kamea-shop

KAMEA is a luxury handmade crochet brand. This Next.js project uses TypeScript, Tailwind CSS, the App Router, and ESLint.

## Start the development server

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Design system

The shared visual tokens live in `src/app/globals.css`:

- **Ink and brown:** `--color-ink`, `--color-brown`, and `--color-brown-dark`
- **Warm neutrals:** `--color-sand`, `--color-cream`, and `--color-white`
- **Typography:** Cormorant Garamond for editorial display type and DM Sans for body text, with system fallbacks
- **Layout:** shared section widths, responsive spacing, focus states, and reduced-motion support

Reusable UI lives in `src/components/`:

- `layout/site-header.tsx` and `layout/site-footer.tsx`
- `home/section-heading.tsx` and `home/newsletter-form.tsx`

Homepage copy and image references are grouped in `src/lib/homepage-data.ts`.
The shared catalogue data and GHS price formatter live in `src/lib/products.ts`; `/shop`, `/catalogue`, `/wishlist`, and `/products/[slug]` use the reusable components in `src/components/shop/`. Product detail galleries, colours, sizes, materials, and care notes are maintained alongside each product in the shared catalogue. The application-level cart context in `src/components/shop/cart-context.tsx` saves the cart and wishlist in browser `localStorage` without requiring an account. Recently viewed products are also kept in local browser storage.

The `/about`, `/contact`, and `/ordering-information` pages provide brand, contact, custom request, and order guidance. Contact address, email, business hours, Instagram profile, delivery charges, and making-time details are placeholders until KAMEA confirms them. Product pages include relevant recommendations and a share action. The homepage gallery uses sample crochet photography until the Instagram profile is configured.

## Brand assets and content

`public/kamea-logo.svg` contains the client's supplied logo and is displayed in the shared site header and footer. The logo component crops the source's built-in whitespace for the available layout while preserving the original file. `src/app/icon.svg` remains the separate browser icon.

Catalogue product names, descriptions, GHS prices, images, availability, materials, colours, and sizes are starter content in `src/lib/products.ts`. Confirm these details and current stock with KAMEA before launch. The cart subtotal is an estimate; delivery charges and the final total are confirmed through WhatsApp. Customers can review their order at `/checkout`, provide delivery details, and select Mobile Money (MoMo), Cash, or Bank Transfer as a preference. No payment is processed on the website; payment is arranged directly with KAMEA in WhatsApp.

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_WHATSAPP_NUMBER` to KAMEA's WhatsApp number with its country code. `NEXT_PUBLIC_INSTAGRAM_URL` can be set to the confirmed Instagram profile URL.

Newsletter sign-ups are forwarded by `/api/newsletter` to the HTTPS endpoint configured with `NEWSLETTER_SUBSCRIPTION_URL`. The endpoint must accept a JSON `POST` containing an `email` field; set `NEWSLETTER_SUBSCRIPTION_TOKEN` if it requires a bearer token. Until KAMEA chooses and configures a provider, the form clearly explains that sign-up is unavailable rather than claiming the customer was subscribed. Homepage review text is sample placeholder copy and should be replaced with real customer reviews.

## Supabase setup

Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for the step-by-step project, database, administrator, and local environment setup. The SQL migration creates and seeds the catalogue, enables Row Level Security, and creates the public product-image bucket. The admin dashboard is at `/admin`; only user IDs explicitly added to `public.admin_users` can access it.

The site uses only the Supabase project URL and publishable/anon key in application configuration. It does not use or require a service-role key. Public visitors can read published products and active categories; database and Storage mutations require the authenticated administrator allowlist and matching RLS policies.

## Useful commands

- `npm run lint` checks the code with ESLint.
- `npm run build` creates a production build.

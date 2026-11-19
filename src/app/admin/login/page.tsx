import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signInAction } from "@/app/admin/actions";
import SiteFooter from "@/components/layout/site-footer";
import SiteHeader from "@/components/layout/site-header";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Administrator sign in",
  robots: { index: false, follow: false },
};

type AdminLoginProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginProps) {
  const { message } = await searchParams;
  const config = getSupabaseConfig();

  if (config.configured) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      redirect("/admin");
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="admin-login-page">
        <section className="admin-auth-card">
          <p className="eyebrow">KAMEA studio</p>
          <h1>Administrator sign in</h1>
          {!config.configured ? (
            <p className="admin-notice">
              Supabase is not configured yet. Follow the setup steps in
              README.md, then add your project URL and publishable/anon key to
              <code> .env.local </code> and restart the dev server.
            </p>
          ) : null}
          {message ? (
            <p className="admin-notice" role="status">
              {message}
            </p>
          ) : null}
          <form action={signInAction} className="admin-form">
            <label className="checkout-field">
              <span>Email</span>
              <input
                autoComplete="username"
                name="email"
                required
                type="email"
              />
            </label>
            <label className="checkout-field">
              <span>Password</span>
              <input
                autoComplete="current-password"
                name="password"
                required
                type="password"
              />
            </label>
            <button
              className="button-link checkout-submit"
              disabled={!config.configured}
              type="submit"
            >
              Sign in
            </button>
          </form>
          <Link className="admin-back-link" href="/">
            Return to the shop
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

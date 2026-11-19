import type { Metadata } from "next";
import Link from "next/link";
import { signOutAction } from "@/app/admin/actions";
import { requireKameaAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await requireKameaAdmin();

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <Link className="admin-brand" href="/admin">
          KAMEA <span>Studio</span>
        </Link>
        <nav aria-label="Admin navigation" className="admin-nav">
          <Link href="/admin">Products</Link>
          <Link href="/admin/categories">Categories</Link>
        </nav>
        <div className="admin-account">
          <span>{user.email}</span>
          <form action={signOutAction}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </header>
      <div className="admin-content">{children}</div>
    </main>
  );
}

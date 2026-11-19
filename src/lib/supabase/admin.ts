import { notFound, redirect } from "next/navigation";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireKameaAdmin() {
  if (!getSupabaseConfig().configured) {
    redirect("/admin/login");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError && userError.name !== "AuthSessionMissingError") {
    throw new Error(`Could not verify the KAMEA admin session: ${userError.message}`);
  }
  if (!user) {
    redirect("/admin/login");
  }

  const { data: administrator, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) {
    throw new Error(
      `Could not verify KAMEA administrator access: ${adminError.message}`,
    );
  }
  if (!administrator) {
    notFound();
  }

  return { supabase, user };
}

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { AdminLoginForm } from "@/components/admin-login-form";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? null;

  if (await verifyAdminSessionToken(sessionValue)) {
    redirect("/admin");
  }

  return <AdminLoginForm />;
}

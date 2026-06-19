import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminShell from "@/components/vault/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Double-check role server-side (middleware also checks, this is defense-in-depth)
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <AdminShell userName={user.name}>
      {children}
    </AdminShell>
  );
}

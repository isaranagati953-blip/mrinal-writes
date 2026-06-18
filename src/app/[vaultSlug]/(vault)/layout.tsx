import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import VaultShell from "@/components/vault/VaultShell";

export default async function VaultLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { vaultSlug: string };
}) {
  // Server-side auth check — if not logged in, send to enter page
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${params.vaultSlug}/enter`);
  }

  return (
    <VaultShell user={{ name: user.name, email: user.email, role: user.role }}>
      {children}
    </VaultShell>
  );
}

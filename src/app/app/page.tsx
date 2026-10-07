import { redirect } from "next/navigation";
import { getCurrentAccount } from "@/lib/auth/session";
import { getGuest } from "@/features/guest/server/session";

/** Installed app entry. Authorization remains in each destination's server boundary. */
export default async function AppEntry() {
  const account = await getCurrentAccount();
  if (account) redirect("/dashboard");
  const guest = await getGuest();
  if (guest) redirect(guest.activeTest ? `/guest/tests/${guest.activeTest}` : "/guest");
  redirect("/login");
}

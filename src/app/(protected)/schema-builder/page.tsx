import { redirect } from "next/navigation";
import { requireAccount } from "@/lib/auth/session";

export default async function SchemaBuilderPage() {
  await requireAccount();
  redirect("/playground");
}

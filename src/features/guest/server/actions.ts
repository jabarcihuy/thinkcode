"use server";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { guestNameSchema } from "../domain/session";
import {
  requireGuest,
  saveGuest,
  clearGuest,
  assertNoAccountTest,
} from "./session";
import { guestTest } from "./catalog";
export async function startGuest(
  _state: { error?: string },
  form: FormData,
): Promise<{ error?: string }> {
  const parsed = guestNameSchema.safeParse(form.get("name"));
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Isi nama terlebih dahulu.",
    };
  try {
    await assertNoAccountTest();
  } catch {
    return {
      error:
        "Selesaikan tes akun yang sedang berlangsung sebelum mencoba mode tamu.",
    };
  }
  await saveGuest({
    kind: "guest",
    id: randomUUID(),
    name: parsed.data,
    expires: Date.now() + 8 * 3600_000,
    activeTest: null,
    hintLevel: 0,
  });
  redirect("/guest");
}
export async function exitGuest() {
  await clearGuest();
  redirect("/");
}
export async function startGuestTest(form: FormData) {
  const guest = await requireGuest();
  const id = String(form.get("testId"));
  const test = await guestTest(id);
  if (!test || !test.items.length) redirect("/guest?view=tests");
  if (guest.activeTest && guest.activeTest !== id)
    redirect(`/guest/tests/${guest.activeTest}`);
  await saveGuest({ ...guest, activeTest: id });
  redirect(`/guest/tests/${id}`);
}
export async function cancelGuestTest() {
  const guest = await requireGuest();
  await saveGuest({ ...guest, activeTest: null });
  redirect("/guest?view=tests");
}

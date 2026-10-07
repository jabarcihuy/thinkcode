"use client";

import { useText } from "@/i18n/use-text";


import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDisplayNameAction, type ProfileActionState } from "@/features/profile/actions";

const initialState: ProfileActionState = {};

export function ProfileForm({ displayName }: { displayName: string }) {
  const tx = useText();

  const [state, action, pending] = useActionState(updateDisplayNameAction, initialState);

  return <form action={action} className="mt-5 max-w-xl">
    <div className="space-y-2">
      <Label htmlFor="display_name">{tx("Nama tampilan")}</Label>
      <Input id="display_name" name="display_name" defaultValue={displayName} maxLength={60} autoComplete="nickname" aria-describedby="display-name-help" />
      <p id="display-name-help" className="text-sm leading-6 text-muted-foreground">{tx("Nama ini ditampilkan di dashboard. Maksimal 60 karakter.")}</p>
    </div>
    {state.error && <p role="alert" className="mt-4 text-sm text-destructive">{tx(state.error)}</p>}
    {state.success && <p role="status" className="mt-4 text-sm text-accent">{tx(state.success)}</p>}
    <Button type="submit" className="mt-5" disabled={pending}>{tx(pending ? "Menyimpan…" : "Simpan profil")}</Button>
  </form>;
}

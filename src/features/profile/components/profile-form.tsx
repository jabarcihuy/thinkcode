"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDisplayNameAction, type ProfileActionState } from "@/features/profile/actions";

const initialState: ProfileActionState = {};

export function ProfileForm({ displayName }: { displayName: string }) {
  const [state, action, pending] = useActionState(updateDisplayNameAction, initialState);

  return <form action={action} className="mt-5 max-w-xl">
    <div className="space-y-2">
      <Label htmlFor="display_name">Nama tampilan</Label>
      <Input id="display_name" name="display_name" defaultValue={displayName} maxLength={60} autoComplete="nickname" aria-describedby="display-name-help" />
      <p id="display-name-help" className="text-sm leading-6 text-muted-foreground">Nama ini ditampilkan di dashboard. Maksimal 60 karakter.</p>
    </div>
    {state.error && <p role="alert" className="mt-4 text-sm text-destructive">{state.error}</p>}
    {state.success && <p role="status" className="mt-4 text-sm text-accent">{state.success}</p>}
    <Button type="submit" className="mt-5" disabled={pending}>{pending ? "Menyimpan…" : "Simpan profil"}</Button>
  </form>;
}

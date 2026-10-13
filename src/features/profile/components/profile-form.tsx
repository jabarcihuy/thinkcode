"use client";
import { useActionState, useState } from "react";
import { useText } from "@/i18n/use-text";
import { Button } from "@/components/ui/button";
import { updateDisplayNameAction, type ProfileActionState } from "../actions";
import { defaultAppearance, type ProfileAppearance } from "../domain/appearance";
import { ProfileFields } from "./profile-fields";
const initialState: ProfileActionState = {};
export function ProfileForm({ displayName, initialAppearance = defaultAppearance, photoEnabled = false }: { displayName: string; initialAppearance?: ProfileAppearance; photoEnabled?: boolean }) {
  const tx = useText();
  const [name, setName] = useState(displayName);
  const [appearance, setAppearance] = useState(initialAppearance);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [state, action, pending] = useActionState(async (previous: ProfileActionState, data: FormData) => {
    const next = await updateDisplayNameAction(previous, data);
    if (next.appearance) setAppearance(next.appearance);
    return next;
  }, initialState);
  return <form action={action} className="mt-5 max-w-xl">
    <fieldset disabled={pending || photoBusy} className="min-w-0"><ProfileFields name={name} appearance={appearance} setName={setName} setAppearance={setAppearance} photoEnabled={photoEnabled} onPhotoBusy={setPhotoBusy} /></fieldset>
    {state.error && <p role="alert" className="mt-4 text-sm text-destructive">{tx(state.error)}</p>}
    {state.success && <p role="status" className="mt-4 text-sm text-primary">{tx(state.success)}</p>}
    <Button type="submit" className="mt-5 min-h-12 w-full sm:w-auto" disabled={pending || photoBusy}>{tx(pending ? "Menyimpan…" : "Simpan profil")}</Button>
  </form>;
}

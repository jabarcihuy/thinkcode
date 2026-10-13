"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useText } from "@/i18n/use-text";
import { useGuestLearning } from "@/features/guest/components/guest-mode";
import { defaultAppearance, type ProfileAppearance } from "../domain/appearance";
import { ProfileFields } from "./profile-fields";
export function GuestProfileEditor({ initialName, initialAppearance = defaultAppearance }: { initialName: string; initialAppearance?: ProfileAppearance }) {
  const tx = useText();
  const local = useGuestLearning();
  const [name, setName] = useState(initialName);
  const [appearance, setAppearance] = useState(initialAppearance);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  return <form className="mt-5 max-w-xl" onSubmit={event => {
    event.preventDefault();
    const ok = Boolean(local?.saveProfile(name.trim(), appearance));
    setError(!ok);
    setMessage(ok ? "Profil tersimpan di perangkat ini." : "Profil belum tersimpan. Periksa izin penyimpanan browser.");
  }}>
    <fieldset disabled={photoBusy} className="min-w-0"><ProfileFields name={name} appearance={appearance} setName={setName} setAppearance={setAppearance} onPhotoBusy={setPhotoBusy} guest /></fieldset>
    <Button type="submit" disabled={photoBusy} className="mt-5 min-h-12 w-full sm:w-auto">{tx("Simpan profil")}</Button>
    {message && <p role={error ? "alert" : "status"} className={`mt-4 text-sm ${error ? "text-destructive" : "text-primary"}`}>{tx(message)}</p>}
  </form>;
}

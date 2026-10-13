"use client";
import { useState } from "react";
import { useText } from "@/i18n/use-text";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { preparePhoto } from "../browser/prepare-photo";
export function ProfilePhotoField({ photo, enabled, onChange, onBusy }: {
  photo?: string | null; enabled: boolean; onChange: (photo: string | null) => void; onBusy: (busy: boolean) => void;
}) {
  const tx = useText();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return <div className="space-y-3">
    <Label htmlFor="profile-photo">{tx("Foto profil")}</Label>
    <input id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={!enabled || busy} aria-describedby="profile-photo-help" className="block min-h-12 w-full min-w-0 rounded-xl border border-border bg-white p-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:font-medium file:text-primary focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50" onChange={async event => {
      const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
      setBusy(true); onBusy(true); setError("");
      try { onChange(await preparePhoto(file)); } catch (cause) { setError(cause instanceof Error ? cause.message : "Foto belum dapat diproses. Coba gambar lain."); }
      finally { setBusy(false); onBusy(false); }
    }} />
    <p id="profile-photo-help" className="text-xs leading-5 text-muted-foreground">{tx(enabled ? "JPG, PNG, WebP · maksimal 5 MB. Foto dipotong persegi." : "Unggah foto akun belum tersedia. Cloudinary belum dikonfigurasi.")}</p>
    {busy && <p role="status" className="text-sm">{tx("Memproses foto…")}</p>}
    {error && <p role="alert" className="text-sm text-destructive">{tx(error)}</p>}
    {photo && <Button type="button" variant="outline" onClick={() => onChange(null)}>{tx("Hapus foto")}</Button>}
    <input type="hidden" name="photo_data" value={photo?.startsWith("data:") ? photo : ""} />
    <input type="hidden" name="remove_photo" value={photo ? "false" : "true"} />
  </div>;
}

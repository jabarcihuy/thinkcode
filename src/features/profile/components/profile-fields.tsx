"use client";
import type { Dispatch, SetStateAction } from "react";
import { ProfilePhotoField } from "./profile-photo-field";
import { useText } from "@/i18n/use-text";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { avatars, avatarColors, type ProfileAppearance } from "../domain/appearance";
import { ProfileAvatar } from "./profile-avatar";

const avatarLabels = { initials: "Inisial", cat: "Kucing", bot: "Robot", sprout: "Tunas", rocket: "Roket", graduate: "Wisuda" };
const colorLabels = { indigo: "Indigo", apricot: "Apricot", teal: "Hijau teal", rose: "Merah muda" };
export function ProfileFields({ name, appearance, setName, setAppearance, guest = false, photoEnabled = false, onPhotoBusy }: {
  name: string; appearance: ProfileAppearance;
  setName: (name: string) => void;
  setAppearance: Dispatch<SetStateAction<ProfileAppearance>>;
  guest?: boolean;
  photoEnabled?: boolean;
  onPhotoBusy: (busy: boolean) => void;
}) {
  const tx = useText();
  return <div className="space-y-6">
    <div className="flex items-center gap-4 rounded-2xl bg-secondary p-5">
      <ProfileAvatar name={name} appearance={appearance} large />
      <div className="min-w-0 [overflow-wrap:anywhere]"><p className="text-xl font-semibold">{name.trim() || tx("Profil")}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{appearance.bio || tx("Pratinjau profilmu")}</p></div>
    </div>
    <ProfilePhotoField photo={appearance.photo} enabled={guest || photoEnabled} onBusy={onPhotoBusy} onChange={photo => setAppearance(current => ({ ...current, photo }))} />
    {appearance.photo && <input type="hidden" name="avatar" value={appearance.avatar} />}
    <fieldset><legend className="mb-3 font-semibold">{tx("Pilih avatar")}</legend><div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {avatars.map(avatar => <label key={avatar} className="cursor-pointer">
        <input type="radio" name="avatar" value={avatar} checked={appearance.avatar === avatar && !appearance.photo} onChange={() => setAppearance({ ...appearance, avatar, photo: null })} className="peer sr-only" />
        <span className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-white p-2 peer-checked:border-primary peer-checked:bg-secondary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring">
          <ProfileAvatar name={name} appearance={{ ...appearance, avatar, photo: null }} /><span className="text-xs font-medium">{tx(avatarLabels[avatar])}</span>
        </span>
      </label>)}
    </div></fieldset>
    <fieldset><legend className="mb-3 font-semibold">{tx("Warna avatar")}</legend><div className="flex flex-wrap gap-3">
      {avatarColors.map(color => <label key={color} className="cursor-pointer">
        <input type="radio" name="color" value={color} checked={appearance.color === color} onChange={() => setAppearance({ ...appearance, color })} className="peer sr-only" />
        <span className="flex min-h-16 min-w-14 items-center justify-center rounded-xl border border-border p-1.5 peer-checked:border-primary peer-checked:ring-1 peer-checked:ring-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring">
          <span className="sr-only">{tx(colorLabels[color])}</span><ProfileAvatar name={name} appearance={{ ...appearance, color, photo: null }} />
        </span>
      </label>)}
    </div></fieldset>
    <div className="space-y-2"><Label htmlFor="display_name">{tx("Nama tampilan")}</Label><Input id="display_name" name="display_name" value={name} onChange={event => setName(event.target.value)} required={guest} minLength={guest ? 2 : undefined} maxLength={60} autoComplete="nickname" /></div>
    <div className="space-y-2"><div className="flex items-center justify-between gap-2"><Label htmlFor="profile-bio">{tx("Bio singkat")}</Label><span className="text-xs tabular-nums text-muted-foreground">{appearance.bio.length}/160</span></div><textarea id="profile-bio" name="bio" value={appearance.bio} onChange={event => setAppearance({ ...appearance, bio: event.target.value })} maxLength={160} rows={3} className="w-full rounded-xl border border-border bg-white p-3 text-base focus-visible:outline-2 focus-visible:outline-ring" placeholder={tx("Ceritakan sedikit tentang dirimu.")} /></div>
  </div>;
}

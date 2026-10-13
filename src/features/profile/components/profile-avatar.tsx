"use client";
import { useState } from "react";
import Image from "next/image";
import { Bot, Cat, GraduationCap, Rocket, Sprout } from "lucide-react";
import { defaultAppearance, type ProfileAppearance } from "../domain/appearance";

const icons = { cat: Cat, bot: Bot, sprout: Sprout, rocket: Rocket, graduate: GraduationCap };
const colors = {
  indigo: "bg-primary text-primary-foreground",
  apricot: "bg-[#FFF0E3] text-[#8A4618]",
  teal: "bg-[#DDF2EC] text-[#175D4E]",
  rose: "bg-[#FBE4ED] text-[#8C3151]",
};
export function ProfileAvatar({ name, appearance = defaultAppearance, large = false }: {
  name: string;
  appearance?: ProfileAppearance;
  large?: boolean;
}) {
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const Icon = appearance.avatar === "initials" ? null : icons[appearance.avatar];
  return <span aria-hidden="true" className={`inline-grid shrink-0 place-items-center rounded-2xl font-semibold ${large ? "size-20 text-3xl" : "size-12 text-lg"} ${colors[appearance.color]}`}>
    {appearance.photo && appearance.photo !== failedPhoto ? <Image src={appearance.photo} alt="" width={large ? 80 : 48} height={large ? 80 : 48} unoptimized onError={() => setFailedPhoto(appearance.photo ?? null)} className="size-full rounded-2xl object-cover" /> : Icon ? <Icon size={large ? 38 : 24} strokeWidth={1.7} /> : Array.from(name.trim())[0]?.toUpperCase() || "Q"}
  </span>;
}
